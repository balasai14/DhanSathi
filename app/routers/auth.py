"""
auth.py — Authentication Router

Endpoints:
  POST /auth/send-otp        — send OTP to email (checks for duplicates)
  POST /auth/verify-otp      — verify OTP, then create account + return JWT
  POST /auth/login           — login with email/password → JWT
  GET  /auth/me              — get current user profile (protected)
  GET  /auth/google          — redirect to Google OAuth consent screen
  GET  /auth/google/callback — exchange Google code → JWT
"""

import random
import smtplib
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from httpx import AsyncClient

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.services.auth_service import hash_password, verify_password, create_access_token
from app.utils.dependencies import get_current_user
from app.config import get_settings

router = APIRouter()
settings = get_settings()

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

OTP_EXPIRY_SECONDS = 600  # 10 minutes

# In-memory OTP store: email -> {otp, expires_at, payload}
_otp_store: Dict[str, dict] = {}

# Separate store for password-reset OTPs
_reset_store: Dict[str, dict] = {}


def _send_email(to_email: str, subject: str, otp: str, label: str = "Email Verification Code") -> None:
    """Generic OTP email sender."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        raise HTTPException(status_code=503, detail="Email service is not configured.")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_USER
    msg["To"] = to_email

    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0f0f13;color:#e2e8f0;border-radius:12px;">
      <h2 style="color:#818cf8;margin-bottom:8px;">DhanSathi</h2>
      <p style="color:#94a3b8;margin-bottom:24px;">Your {label}:</p>
      <div style="font-size:36px;font-weight:800;letter-spacing:12px;color:#fff;background:#1e1e2e;padding:20px;border-radius:8px;text-align:center;">{otp}</div>
      <p style="color:#64748b;font-size:13px;margin-top:24px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
    </div>
    """
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USER, to_email, msg.as_string())


def _send_otp_email(to_email: str, otp: str) -> None:
    _send_email(to_email, "Your DhanSathi verification code", otp, label="email verification code")


# ── OTP Flow ─────────────────────────────────────────────

class SendOtpRequest(UserCreate):
    pass  # same fields: email, full_name, password


from pydantic import BaseModel

class VerifyOtpRequest(BaseModel):
    email: str
    otp: str


@router.post("/send-otp", status_code=200)
def send_otp(payload: SendOtpRequest, db: Session = Depends(get_db)):
    """Check for duplicate email, generate OTP, send to email."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        if existing.oauth_provider == "google":
            raise HTTPException(
                status_code=400,
                detail="This email is linked to a Google account. Please sign in with Google."
            )
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    otp = str(random.randint(100000, 999999))
    _otp_store[payload.email] = {
        "otp": otp,
        "expires_at": time.time() + OTP_EXPIRY_SECONDS,
        "full_name": payload.full_name,
        "password": payload.password,
    }

    _send_otp_email(payload.email, otp)
    return {"message": "OTP sent to your email."}


@router.post("/verify-otp", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def verify_otp(payload: VerifyOtpRequest, db: Session = Depends(get_db)):
    """Verify OTP and create the account."""
    record = _otp_store.get(payload.email)
    if not record:
        raise HTTPException(status_code=400, detail="No OTP found for this email. Please request a new one.")
    if time.time() > record["expires_at"]:
        _otp_store.pop(payload.email, None)
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")
    if record["otp"] != payload.otp:
        raise HTTPException(status_code=400, detail="Incorrect OTP.")

    # Double-check email not taken (race condition guard)
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        _otp_store.pop(payload.email, None)
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    new_user = User(
        email=payload.email,
        full_name=record["full_name"],
        hashed_password=hash_password(record["password"]),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    _otp_store.pop(payload.email, None)

    token = create_access_token(data={"sub": new_user.email})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(new_user))


# ── Forgot / Reset Password ───────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str


@router.post("/forgot-password", status_code=200)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Send a password-reset OTP. Works for all accounts including Google-only."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email address.")

    otp = str(random.randint(100000, 999999))
    _reset_store[payload.email] = {
        "otp": otp,
        "expires_at": time.time() + OTP_EXPIRY_SECONDS,
    }
    _send_email(payload.email, "Your DhanSathi password reset code", otp, label="password reset code")
    return {"message": "Reset code sent to your email."}


@router.post("/reset-password", status_code=200)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Verify reset OTP and set new password. Also enables manual login for Google accounts."""
    record = _reset_store.get(payload.email)
    if not record:
        raise HTTPException(status_code=400, detail="No reset code found. Please request a new one.")
    if time.time() > record["expires_at"]:
        _reset_store.pop(payload.email, None)
        raise HTTPException(status_code=400, detail="Reset code has expired. Please request a new one.")
    if record["otp"] != payload.otp:
        raise HTTPException(status_code=400, detail="Incorrect code.")
    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    _reset_store.pop(payload.email, None)
    return {"message": "Password updated successfully. You can now sign in."}


# ── Email / Password Login ────────────────────────────────

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.hashed_password:
        if user and user.oauth_provider and not user.hashed_password:
            raise HTTPException(status_code=401, detail="This account uses Google sign-in. Use 'Forgot Password' to set a password for manual login.")
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token(data={"sub": user.email})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


# ── Change Password (authenticated) ──────────────────────

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


@router.post("/change-password", status_code=200)
def change_password(payload: ChangePasswordRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Change password while logged in. Google-only accounts must use forgot-password first."""
    if not current_user.hashed_password:
        raise HTTPException(status_code=400, detail="No password set on this account. Use 'Forgot Password' to set one.")
    if not verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password changed successfully."}


# ── Google OAuth ─────────────────────────────────────────

@router.get("/google")
def google_login():
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=503, detail="Google OAuth is not configured.")

    params = (
        f"?client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope=openid%20email%20profile"
        f"&access_type=offline"
        f"&prompt=select_account"
    )
    return RedirectResponse(url=GOOGLE_AUTH_URL + params)


@router.get("/google/callback", response_model=TokenResponse)
async def google_callback(code: str, db: Session = Depends(get_db)):
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=503, detail="Google OAuth is not configured.")

    async with AsyncClient() as client:
        token_res = await client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        if token_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange Google code.")

        access_token = token_res.json().get("access_token")

        userinfo_res = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if userinfo_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch Google user info.")

        info = userinfo_res.json()

    google_id = info.get("sub")
    email = info.get("email")
    full_name = info.get("name") or email.split("@")[0]
    avatar_url = info.get("picture")

    if not email or not google_id:
        raise HTTPException(status_code=400, detail="Google did not return email or user ID.")

    user = db.query(User).filter(User.oauth_id == google_id).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()

    if user:
        if not user.oauth_provider:
            user.oauth_provider = "google"
            user.oauth_id = google_id
        if avatar_url:
            user.avatar_url = avatar_url
        db.commit()
        db.refresh(user)
    else:
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=None,
            oauth_provider="google",
            oauth_id=google_id,
            avatar_url=avatar_url,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    jwt_token = create_access_token(data={"sub": user.email})
    return TokenResponse(access_token=jwt_token, user=UserResponse.model_validate(user))
