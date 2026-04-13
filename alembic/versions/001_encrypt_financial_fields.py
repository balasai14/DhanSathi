"""encrypt financial fields

Revision ID: 001
Revises:
Create Date: 2026-04-12

Converts all sensitive Float columns to VARCHAR(512) and encrypts
existing plain-text values using the FIELD_ENCRYPTION_KEY from .env.

Safe to run multiple times — already-encrypted values are detected and skipped.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.orm import Session

from app.utils.crypto import encrypt_value, decrypt_value

revision = "001"
down_revision = None
branch_labels = None
depends_on = None

# ── Map: table → list of float columns to encrypt ────────
TABLES_COLUMNS: dict[str, list[str]] = {
    "incomes":            ["amount"],
    "expenses":           ["monthly_amount"],
    "investments":        ["quantity", "buy_price", "interest_rate"],
    "loans":              ["principal_amount", "outstanding_balance", "interest_rate", "emi_amount"],
    "budgets":            ["budgeted_amount", "actual_amount"],
    "emergency_funds":    ["current_amount", "target_amount", "monthly_contribution"],
    "insurance_policies": ["coverage_amount", "annual_premium"],
    "financial_goals":    ["target_amount", "current_amount", "monthly_contribution"],
    "retirement_plans":   ["current_value", "monthly_contribution", "expected_return_rate", "desired_monthly_income"],
    "tax_records":        ["gross_income", "deduction_amount", "tax_paid"],
}


def _is_already_encrypted(value: str) -> bool:
    """Fernet tokens start with 'gAAAAA' (base64 of version byte 0x80)."""
    return isinstance(value, str) and value.startswith("gAAAAA")


def upgrade() -> None:
    bind = op.get_bind()
    session = Session(bind=bind)

    for table, columns in TABLES_COLUMNS.items():
        # Step 1: alter column types from FLOAT/DOUBLE to VARCHAR(512)
        for col in columns:
            op.alter_column(
                table, col,
                existing_type=sa.Float(),
                type_=sa.String(512),
                existing_nullable=True,
                postgresql_using=f"{col}::varchar",
            )

        # Step 2: encrypt existing plain-text values row by row
        rows = session.execute(sa.text(f"SELECT id, {', '.join(columns)} FROM {table}")).fetchall()
        for row in rows:
            row_id = row[0]
            updates = {}
            for i, col in enumerate(columns):
                raw = row[i + 1]
                if raw is None:
                    continue
                str_val = str(raw)
                if _is_already_encrypted(str_val):
                    continue  # skip already-encrypted values
                try:
                    float_val = float(str_val)
                    updates[col] = encrypt_value(float_val)
                except (ValueError, TypeError):
                    continue  # skip unparseable values

            if updates:
                set_clause = ", ".join(f"{k} = :{k}" for k in updates)
                updates["_id"] = row_id
                session.execute(
                    sa.text(f"UPDATE {table} SET {set_clause} WHERE id = :_id"),
                    updates,
                )

    session.commit()


def downgrade() -> None:
    """
    Decrypt all values and convert columns back to FLOAT.
    WARNING: this restores plain-text financial data in the DB.
    """
    bind = op.get_bind()
    session = Session(bind=bind)

    for table, columns in TABLES_COLUMNS.items():
        rows = session.execute(sa.text(f"SELECT id, {', '.join(columns)} FROM {table}")).fetchall()
        for row in rows:
            row_id = row[0]
            updates = {}
            for i, col in enumerate(columns):
                raw = row[i + 1]
                if raw is None:
                    continue
                if _is_already_encrypted(str(raw)):
                    decrypted = decrypt_value(str(raw))
                    if decrypted is not None:
                        updates[col] = str(decrypted)

            if updates:
                set_clause = ", ".join(f"{k} = :{k}" for k in updates)
                updates["_id"] = row_id
                session.execute(
                    sa.text(f"UPDATE {table} SET {set_clause} WHERE id = :_id"),
                    updates,
                )

        session.commit()

        for col in columns:
            op.alter_column(
                table, col,
                existing_type=sa.String(512),
                type_=sa.Float(),
                existing_nullable=True,
                postgresql_using=f"{col}::double precision",
            )
