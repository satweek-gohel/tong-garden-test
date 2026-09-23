from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.config import settings
from app.core.exceptions import InvalidCredentialsError, NotFoundError, UnauthorizedError
from app.core.security import (
    create_access_token,
    generate_otp,
    generate_secure_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.models.email_token import EmailToken
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.services.email_service import send_mock_email

EMAIL_VERIFICATION = "email_verification"
PASSWORD_RESET = "password_reset"


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def authenticate(self, email: str, password: str) -> User:
        user = self.db.query(User).filter(User.email == email, User.is_active == True).first()
        if not user or not verify_password(password, user.password_hash):
            raise InvalidCredentialsError()
        return user

    def issue_tokens(self, user: User) -> tuple[str, str]:
        access_token = create_access_token(subject=str(user.id))

        raw_refresh_token, token_hash = generate_secure_token()
        expires_at = datetime.now(UTC) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        db_refresh_token = RefreshToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            revoked=False,
        )
        self.db.add(db_refresh_token)
        self.db.commit()

        return access_token, raw_refresh_token

    def refresh(self, raw_refresh_token: str) -> tuple[str, str, User]:
        token_hash = hash_token(raw_refresh_token)
        db_token = self.db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()

        now = datetime.now(UTC)
        expires_at = db_token.expires_at.replace(tzinfo=UTC) if db_token else None

        if not db_token or db_token.revoked or (expires_at and expires_at < now):
            raise UnauthorizedError("Refresh token is invalid or expired")

        user = self.db.query(User).filter(User.id == db_token.user_id, User.is_active == True).first()
        if not user:
            raise UnauthorizedError("User not found")

        db_token.revoked = True
        self.db.add(db_token)
        self.db.commit()

        access_token, new_refresh_token = self.issue_tokens(user)
        return access_token, new_refresh_token, user

    def logout(self, raw_refresh_token: str | None) -> None:
        if not raw_refresh_token:
            return
        token_hash = hash_token(raw_refresh_token)
        db_token = self.db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
        if db_token:
            db_token.revoked = True
            self.db.add(db_token)
            self.db.commit()

    def revoke_all_refresh_tokens(self, user_id: int) -> None:
        self.db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id, RefreshToken.revoked == False
        ).update({"revoked": True})
        self.db.commit()

    def send_verification_email(self, user: User) -> str | None:
        raw_token, token_hash = generate_secure_token()
        expires_at = datetime.now(UTC) + timedelta(hours=settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS)

        self.db.add(
            EmailToken(
                user_id=user.id,
                token_hash=token_hash,
                purpose=EMAIL_VERIFICATION,
                expires_at=expires_at,
            )
        )
        self.db.commit()

        link = f"{settings.FRONTEND_URL}/verify-email?token={raw_token}"
        send_mock_email(user.email, "Verify your Tong Garden Operations account", link)
        return link if settings.DEBUG else None

    def resend_verification_email(self, email: str) -> str | None:
        user = self.db.query(User).filter(User.email == email, User.is_active == True).first()
        if not user:
            return None
        if user.is_verified:
            return None
        return self.send_verification_email(user)

    def verify_email(self, raw_token: str) -> User:
        db_token = self._consume_token(raw_token, EMAIL_VERIFICATION)
        user = self.db.query(User).filter(User.id == db_token.user_id).first()
        if not user:
            raise NotFoundError("User not found")
        user.is_verified = True
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def request_password_reset(self, email: str) -> str | None:
        user = self.db.query(User).filter(User.email == email, User.is_active == True).first()
        if not user:
            return None

        otp = generate_otp(settings.PASSWORD_RESET_OTP_LENGTH)
        expires_at = datetime.now(UTC) + timedelta(minutes=settings.PASSWORD_RESET_OTP_EXPIRE_MINUTES)

        self.db.add(
            EmailToken(
                user_id=user.id,
                token_hash=hash_token(otp),
                purpose=PASSWORD_RESET,
                expires_at=expires_at,
            )
        )
        self.db.commit()

        send_mock_email(
            user.email,
            "Your Tong Garden Operations password reset code",
            f"Your one-time code is {otp}. It expires in {settings.PASSWORD_RESET_OTP_EXPIRE_MINUTES} minutes.",
        )
        return otp if settings.DEBUG else None

    def reset_password(self, email: str, otp: str, new_password: str) -> User:
        user = self.db.query(User).filter(User.email == email, User.is_active == True).first()
        if not user:
            raise UnauthorizedError("Invalid email or code")

        token_hash = hash_token(otp)
        db_token = (
            self.db.query(EmailToken)
            .filter(
                EmailToken.user_id == user.id,
                EmailToken.purpose == PASSWORD_RESET,
                EmailToken.token_hash == token_hash,
            )
            .first()
        )

        now = datetime.now(UTC)
        expires_at = db_token.expires_at.replace(tzinfo=UTC) if db_token else None

        if not db_token or db_token.used_at is not None or (expires_at and expires_at < now):
            raise UnauthorizedError("Invalid email or code")

        db_token.used_at = now
        self.db.add(db_token)

        user.password_hash = hash_password(new_password)
        self.db.add(user)
        self.db.commit()

        self.revoke_all_refresh_tokens(user.id)

        self.db.refresh(user)
        return user

    def _consume_token(self, raw_token: str, purpose: str) -> EmailToken:
        token_hash = hash_token(raw_token)
        db_token = (
            self.db.query(EmailToken)
            .filter(EmailToken.token_hash == token_hash, EmailToken.purpose == purpose)
            .first()
        )

        now = datetime.now(UTC)
        expires_at = db_token.expires_at.replace(tzinfo=UTC) if db_token else None

        if not db_token or db_token.used_at is not None or (expires_at and expires_at < now):
            raise UnauthorizedError("This link is invalid or has expired")

        db_token.used_at = now
        self.db.add(db_token)
        self.db.commit()

        return db_token
