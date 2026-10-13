from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import (
    create_access_token, decode_token, generate_otp, hash_password, verify_password,
)
from app.models.models import PasswordResetOTP, User
from app.schemas.schemas import (
    ChangePasswordRequest, ForgotPasswordRequestOTP, ForgotPasswordReset,
    ForgotPasswordVerifyOTP, LoginRequest, RegisterRequest, TokenResponse, UserOut,
)
from app.utils.otp_service import send_otp

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register/", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.phone_number == payload.phone_number).first():
        raise HTTPException(status_code=400, detail={"phone_number": "An account with this phone number already exists."})

    user = User(
        full_name=payload.full_name.strip(),
        phone_number=payload.phone_number.strip(),
        password_hash=hash_password(payload.password),
        is_owner=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"user_id": user.id})
    return TokenResponse(token=token, user=UserOut.model_validate(user))


@router.post("/login/", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    identifier = payload.identifier.strip()
    user = (
        db.query(User)
        .filter((User.phone_number == identifier) | (User.email == identifier))
        .first()
    )
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials. Please check and try again.")

    token = create_access_token({"user_id": user.id})
    return TokenResponse(token=token, user=UserOut.model_validate(user))


@router.post("/logout/")
def logout(user: User = Depends(get_current_user)):
    # Stateless JWT - logout is handled client-side by discarding the token.
    return {"detail": "Logged out successfully."}


@router.get("/profile/", response_model=UserOut)
def profile(user: User = Depends(get_current_user)):
    return user


@router.post("/change-password/")
def change_password(
    payload: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lets a logged-in user (including the owner) change their own password securely."""
    if not verify_password(payload.old_password, user.password_hash):
        raise HTTPException(status_code=400, detail={"old_password": "Current password is incorrect."})
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"detail": "Password updated successfully."}


# ---------- Forgot password / OTP recovery ----------

@router.post("/forgot-password/request-otp/")
def request_otp(payload: ForgotPasswordRequestOTP, db: Session = Depends(get_db)):
    phone_number = payload.phone_number.strip()
    user = db.query(User).filter(User.phone_number == phone_number).first()
    if not user:
        # Don't reveal whether the number is registered.
        return {"detail": "If this number is registered, an OTP has been sent."}

    otp = generate_otp()
    record = PasswordResetOTP(
        phone_number=phone_number,
        otp_hash=hash_password(otp),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES),
    )
    db.add(record)
    db.commit()

    send_otp(phone_number, otp)

    response = {"detail": "If this number is registered, an OTP has been sent."}
    if settings.DEBUG:
        # Dev-only convenience since no real SMS provider is wired up yet -
        # never returned when DEBUG is False. See app/utils/otp_service.py.
        response["dev_otp"] = otp
    return response


@router.post("/forgot-password/verify-otp/")
def verify_otp(payload: ForgotPasswordVerifyOTP, db: Session = Depends(get_db)):
    phone_number = payload.phone_number.strip()
    record = (
        db.query(PasswordResetOTP)
        .filter(PasswordResetOTP.phone_number == phone_number, PasswordResetOTP.is_used.is_(False))
        .order_by(PasswordResetOTP.created_at.desc())
        .first()
    )
    if not record:
        raise HTTPException(status_code=400, detail="No OTP request found. Please request a new one.")

    if datetime.now(timezone.utc) > record.expires_at.replace(tzinfo=timezone.utc):
        raise HTTPException(status_code=400, detail="This OTP has expired. Please request a new one.")

    if record.attempts >= 5:
        raise HTTPException(status_code=429, detail="Too many attempts. Please request a new OTP.")

    record.attempts += 1
    if not verify_password(payload.otp, record.otp_hash):
        db.commit()
        raise HTTPException(status_code=400, detail="Incorrect OTP. Please try again.")

    record.is_used = True
    db.commit()

    reset_token = create_access_token(
        {"phone_number": phone_number, "purpose": "password_reset"},
        expires_minutes=settings.RESET_TOKEN_EXPIRE_MINUTES,
    )
    return {"reset_token": reset_token}


@router.post("/forgot-password/reset/")
def reset_password(payload: ForgotPasswordReset, db: Session = Depends(get_db)):
    data = decode_token(payload.reset_token)
    if not data or data.get("purpose") != "password_reset":
        raise HTTPException(status_code=400, detail="This reset link has expired. Please start over.")

    user = db.query(User).filter(User.phone_number == data["phone_number"]).first()
    if not user:
        raise HTTPException(status_code=400, detail="Account not found.")

    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"detail": "Password reset successfully. You can now log in."}
