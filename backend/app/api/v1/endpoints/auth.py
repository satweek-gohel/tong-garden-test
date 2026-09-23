from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.orm import Session

from app.config import settings
from app.core.cookies import clear_auth_cookies, set_auth_cookies
from app.core.deps import get_current_user
from app.core.exceptions import UnauthorizedError
from app.core.rate_limit import check_login_rate_limit, record_failed_login, reset_login_attempts
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    MockEmailResponse,
    MockOtpResponse,
    ResendVerificationRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
)
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services.auth_service import AuthService
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: Session = Depends(get_db)):
    service = UserService(db)
    user = service.create_user(user_in)
    AuthService(db).send_verification_email(user)
    return user


@router.post("/login", response_model=UserResponse)
async def login(credentials: UserLogin, response: Response, db: Session = Depends(get_db)):
    rate_limit_key = credentials.email.lower()
    check_login_rate_limit(rate_limit_key)

    auth_service = AuthService(db)
    try:
        user = auth_service.authenticate(credentials.email, credentials.password)
    except Exception:
        record_failed_login(rate_limit_key)
        raise

    reset_login_attempts(rate_limit_key)

    access_token, refresh_token = auth_service.issue_tokens(user)
    set_auth_cookies(response, access_token, refresh_token)
    return user


@router.post("/refresh", response_model=UserResponse)
async def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    raw_refresh_token = request.cookies.get(settings.REFRESH_TOKEN_COOKIE_NAME)
    if not raw_refresh_token:
        raise UnauthorizedError("No refresh token provided")

    auth_service = AuthService(db)
    access_token, new_refresh_token, user = auth_service.refresh(raw_refresh_token)
    set_auth_cookies(response, access_token, new_refresh_token)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    raw_refresh_token = request.cookies.get(settings.REFRESH_TOKEN_COOKIE_NAME)
    AuthService(db).logout(raw_refresh_token)
    clear_auth_cookies(response)


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/resend-verification", response_model=MockEmailResponse)
async def resend_verification(payload: ResendVerificationRequest, db: Session = Depends(get_db)):
    dev_link = AuthService(db).resend_verification_email(payload.email)
    return MockEmailResponse(
        message="If that account exists and isn't verified yet, a verification link was sent.",
        dev_link=dev_link,
    )


@router.post("/verify-email", response_model=UserResponse)
async def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    return AuthService(db).verify_email(payload.token)


@router.post("/forgot-password", response_model=MockOtpResponse)
async def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    dev_otp = AuthService(db).request_password_reset(payload.email)
    return MockOtpResponse(
        message="If that email is registered, a one-time code was sent.",
        dev_otp=dev_otp,
    )


@router.post("/reset-password", response_model=UserResponse)
async def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    return AuthService(db).reset_password(payload.email, payload.otp, payload.new_password)
