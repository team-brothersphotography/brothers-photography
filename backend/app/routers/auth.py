
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import (
    create_access_token,
    decode_token,
    hash_password,
    normalize_security_answer,
    verify_password,
)
from app.models.models import PasswordResetToken, User, UserSecurityQuestion, UserOAuthAccount
from app.schemas.schemas import (
    ChangePasswordRequest,
    ForgotPasswordAnswersRequest,
    ForgotPasswordQuestionsRequest,
    ForgotPasswordResetRequest,
    LoginRequest,
    RegisterRequest,
    SECURITY_QUESTIONS,
    TokenResponse,
    UserOut,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])
class GoogleSignInRequest(BaseModel):
    credential: str = Field(min_length=1)
class GooglePrepareRequest(BaseModel):
    credential: str = Field(min_length=1)

class GoogleCompleteRequest(BaseModel):
    credential: str = Field(min_length=1)
    phone_number: str = Field(min_length=7, max_length=20)
GENERIC_RECOVERY_MESSAGE = (
    "Unable to verify recovery details. Check your information or try again later."
)


def utc_now():
    return datetime.now(timezone.utc)



import re

def normalize_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)

    # Accept Indian numbers with or without the +91 country code.
    if len(digits) == 10:
        digits = "91" + digits
    elif len(digits) == 12 and digits.startswith("91"):
        pass
    else:
        raise HTTPException(
            status_code=422,
            detail={"phone_number": "Enter a valid Indian mobile number, with or without +91."},
        )

    mobile = digits[2:]
    if mobile[0] not in "6789":
        raise HTTPException(
            status_code=422,
            detail={"phone_number": "Enter a valid Indian mobile number."},
        )

    return "+" + digits


def token_digest(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def verify_google_credential(credential: str):
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=503,
            detail="Google sign-in is not configured on the server.",
        )

    try:
        info = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Google sign-in could not be verified. Please try again.",
        )

    if not info.get("sub") or not info.get("email") or info.get("email_verified") is not True:
        raise HTTPException(
            status_code=401,
            detail="A verified Google email is required.",
        )

    return info


def google_account_response(user: User):
    token = create_access_token({"user_id": user.id})
    return {
        "needs_phone": False,
        "token": token,
        "user": UserOut.model_validate(user),
    }


@router.post("/google/prepare/")
def google_prepare(
    payload: GooglePrepareRequest,
    db: Session = Depends(get_db),
):
    info = verify_google_credential(payload.credential)

    linked = (
        db.query(UserOAuthAccount)
        .filter(
            UserOAuthAccount.provider == "google",
            UserOAuthAccount.provider_subject == info["sub"],
        )
        .first()
    )

    if linked:
        user = db.query(User).filter(User.id == linked.user_id).first()
        if not user or user.is_owner:
            raise HTTPException(status_code=403, detail="This account cannot use customer Google sign-in.")
        return google_account_response(user)

    email = info["email"].strip().lower()
    existing = db.query(User).filter(User.email == email).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="An account already uses this email. Please log in with that account first.",
        )

    return {
        "needs_phone": True,
        "email": email,
        "full_name": info.get("name") or email.split("@")[0],
    }


@router.post("/google/complete/")
def google_complete(
    payload: GoogleCompleteRequest,
    db: Session = Depends(get_db),
):
    info = verify_google_credential(payload.credential)

    linked = (
        db.query(UserOAuthAccount)
        .filter(
            UserOAuthAccount.provider == "google",
            UserOAuthAccount.provider_subject == info["sub"],
        )
        .first()
    )

    if linked:
        user = db.query(User).filter(User.id == linked.user_id).first()
        if not user or user.is_owner:
            raise HTTPException(status_code=403, detail="This account cannot use customer Google sign-in.")
        return google_account_response(user)

    email = info["email"].strip().lower()

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=409,
            detail="An account already uses this email. Please log in with that account first.",
        )

    phone = normalize_phone(payload.phone_number)

    if db.query(User).filter(User.phone_number == phone).first():
        raise HTTPException(
            status_code=409,
            detail="This phone number already has an account. Please log in instead.",
        )

    user = User(
        full_name=(info.get("name") or email.split("@")[0]).strip()[:150],
        email=email,
        phone_number=phone,
        password_hash=hash_password(secrets.token_urlsafe(48)),
        is_owner=False,
    )

    try:
        db.add(user)
        db.flush()

        db.add(
            UserOAuthAccount(
                user_id=user.id,
                provider="google",
                provider_subject=info["sub"],
            )
        )

        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This account or phone number already exists. Please try signing in again.",
        )

    return google_account_response(user)

@router.post("/register/", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    phone = normalize_phone(payload.phone_number)

    if db.query(User).filter(User.phone_number == phone).first():
        raise HTTPException(
            status_code=409,
            detail={
                "phone_number": (
                    "An account with this phone number already exists. "
                    "Please log in instead."
                )
            },
        )

    user = User(
        full_name=payload.full_name.strip(),
        phone_number=phone,
        password_hash=hash_password(payload.password),
        is_owner=False,
    )

    try:
        db.add(user)
        db.flush()

        for item in payload.security_answers:
            db.add(
                UserSecurityQuestion(
                    user_id=user.id,
                    question_key=item.question_key,
                    answer_hash=hash_password(
                        normalize_security_answer(item.answer)
                    ),
                )
            )

        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail={
                "phone_number": (
                    "An account with this phone number already exists. "
                    "Please log in instead."
                )
            },
        )

    token = create_access_token({"user_id": user.id})
    return TokenResponse(token=token, user=UserOut.model_validate(user))


@router.post("/login/", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    identifier = payload.identifier.strip()

    if "@" in identifier:
        user = db.query(User).filter(User.email == identifier).first()
    else:
        phone = normalize_phone(identifier)
        user = db.query(User).filter(User.phone_number == phone).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials. Please check and try again.",
        )

    token = create_access_token({"user_id": user.id})
    return TokenResponse(token=token, user=UserOut.model_validate(user))

@router.post("/logout/")
def logout(user: User = Depends(get_current_user)):
    # JWT logout is client-side: discard the stored token.
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
    if not verify_password(payload.old_password, user.password_hash):
        raise HTTPException(
            status_code=400,
            detail={"old_password": "Current password is incorrect."},
        )

    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"detail": "Password updated successfully."}


@router.post("/forgot-password/questions/")
def recovery_questions(
    payload: ForgotPasswordQuestionsRequest,
    db: Session = Depends(get_db),
):
    phone = normalize_phone(payload.phone_number)
    user = db.query(User).filter(User.phone_number == phone).first()

    # Owner accounts cannot use customer security-question recovery.
    if not user or user.is_owner:
        return {"questions": [], "recovery_available": False}

    saved = (
        db.query(UserSecurityQuestion.question_key)
        .filter(UserSecurityQuestion.user_id == user.id)
        .all()
    )
    keys = {row[0] for row in saved}

    return {
        "questions": [
            {"key": key, "text": SECURITY_QUESTIONS[key]}
            for key in SECURITY_QUESTIONS
            if key in keys
        ],
        "recovery_available": len(keys) == 3,
    }


@router.post("/forgot-password/verify-answers/")
def verify_recovery_answers(
    payload: ForgotPasswordAnswersRequest,
    db: Session = Depends(get_db),
):
    phone = normalize_phone(payload.phone_number)
    user = db.query(User).filter(User.phone_number == phone).first()

    if not user or user.is_owner:
        raise HTTPException(status_code=400, detail=GENERIC_RECOVERY_MESSAGE)

    answers = {
        item.question_key: normalize_security_answer(item.answer)
        for item in payload.security_answers
    }

    saved = (
        db.query(UserSecurityQuestion)
        .filter(UserSecurityQuestion.user_id == user.id)
        .all()
    )
    saved_by_key = {item.question_key: item for item in saved}

    # Require exactly the three questions stored for this customer.
    if len(saved_by_key) != 3 or set(answers) != set(saved_by_key):
        raise HTTPException(status_code=400, detail=GENERIC_RECOVERY_MESSAGE)

    # A short-lived database record will enforce one-time token use.
    for key, answer in answers.items():
        if not verify_password(answer, saved_by_key[key].answer_hash):
            raise HTTPException(
                status_code=400,
                detail=GENERIC_RECOVERY_MESSAGE,
            )

    raw_token = secrets.token_urlsafe(32)
    expires = utc_now() + timedelta(
        minutes=min(settings.RESET_TOKEN_EXPIRE_MINUTES, 10)
    )

    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=token_digest(raw_token),
            expires_at=expires,
        )
    )
    db.commit()

    return {"reset_token": raw_token}


@router.post("/forgot-password/reset/")
def reset_password(
    payload: ForgotPasswordResetRequest,
    db: Session = Depends(get_db),
):
    digest = token_digest(payload.reset_token)
    record = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token_hash == digest)
        .with_for_update()
        .first()
    )

    if (
        not record
        or record.is_used
        or record.expires_at.replace(tzinfo=timezone.utc) < utc_now()
    ):
        raise HTTPException(
            status_code=400,
            detail="This reset link has expired or was already used. Please start over.",
        )

    user = db.query(User).filter(User.id == record.user_id).first()
    if not user or user.is_owner:
        raise HTTPException(status_code=400, detail=GENERIC_RECOVERY_MESSAGE)

    user.password_hash = hash_password(payload.new_password)
    record.is_used = True
    db.commit()

    return {"detail": "Password reset successfully. You can now log in."}
