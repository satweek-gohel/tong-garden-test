import time
from collections import defaultdict

from app.config import settings
from app.core.exceptions import ApplicationException


class RateLimitExceededError(ApplicationException):
    def __init__(self, message: str = "Too many login attempts. Try again later."):
        super().__init__(message, status_code=429)


_failed_attempts: dict[str, list[float]] = defaultdict(list)


def _window_seconds() -> int:
    return settings.LOGIN_RATE_LIMIT_WINDOW_MINUTES * 60


def check_login_rate_limit(key: str) -> None:
    now = time.time()
    window_start = now - _window_seconds()
    attempts = [t for t in _failed_attempts[key] if t > window_start]
    _failed_attempts[key] = attempts

    if len(attempts) >= settings.LOGIN_RATE_LIMIT_ATTEMPTS:
        raise RateLimitExceededError()


def record_failed_login(key: str) -> None:
    _failed_attempts[key].append(time.time())


def reset_login_attempts(key: str) -> None:
    _failed_attempts.pop(key, None)
