"""
crypto.py — Field-level encryption for sensitive financial data.

Uses Fernet (AES-128-CBC + HMAC-SHA256) symmetric encryption.
The key lives only in the environment — never in the database.

Encrypted values are stored as base64 strings in Text columns.
Decryption happens in-app, so the DB (and anyone viewing it) sees only ciphertext.
"""

import base64
from cryptography.fernet import Fernet, InvalidToken
from sqlalchemy import String
from sqlalchemy.types import TypeDecorator

from app.config import get_settings


def _get_fernet() -> Fernet:
    key = get_settings().FIELD_ENCRYPTION_KEY
    if not key:
        raise RuntimeError("FIELD_ENCRYPTION_KEY is not set in environment.")
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt_value(value: float | None) -> str | None:
    """Encrypt a float → base64 ciphertext string."""
    if value is None:
        return None
    fernet = _get_fernet()
    return fernet.encrypt(str(value).encode()).decode()


def decrypt_value(token: str | None) -> float | None:
    """Decrypt a base64 ciphertext string → float."""
    if token is None:
        return None
    try:
        fernet = _get_fernet()
        return float(fernet.decrypt(token.encode()).decode())
    except (InvalidToken, ValueError):
        # If already a plain float string (pre-migration rows), return as-is
        try:
            return float(token)
        except ValueError:
            return None


class EncryptedFloat(TypeDecorator):
    """
    SQLAlchemy column type that transparently encrypts/decrypts float values.

    Usage in models:
        amount = Column(EncryptedFloat, nullable=False)

    The DB stores a Text ciphertext; Python sees a float.
    """
    impl = String(512)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        """Python → DB: encrypt before writing."""
        if value is None:
            return None
        return encrypt_value(float(value))

    def process_result_value(self, value, dialect):
        """DB → Python: decrypt after reading."""
        if value is None:
            return None
        return decrypt_value(value)
