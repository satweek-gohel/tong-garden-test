from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Tong Garden Operations API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/tong_garden_db"
    DB_ECHO: bool = False

    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    COOKIE_SECURE: bool = False
    COOKIE_DOMAIN: str | None = None
    ACCESS_TOKEN_COOKIE_NAME: str = "access_token"
    REFRESH_TOKEN_COOKIE_NAME: str = "refresh_token"

    LOGIN_RATE_LIMIT_ATTEMPTS: int = 5
    LOGIN_RATE_LIMIT_WINDOW_MINUTES: int = 15

    FRONTEND_URL: str = "http://localhost:3000"
    EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS: int = 24
    PASSWORD_RESET_OTP_LENGTH: int = 6
    PASSWORD_RESET_OTP_EXPIRE_MINUTES: int = 10

    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    REDIS_URL: str = "redis://localhost:6379"
    CELERY_BROKER_URL: str = "redis://localhost:6379"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379"

    ERP_API_URL: str | None = None
    PAYMENT_GATEWAY_API_KEY: str | None = None

    class Config:
        env_file = ".env"


settings = Settings()
