class ApplicationException(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundError(ApplicationException):
    def __init__(self, message: str):
        super().__init__(message, status_code=404)


class UserNotFoundError(NotFoundError):
    pass


class DuplicateEmailError(ApplicationException):
    def __init__(self, message: str):
        super().__init__(message, status_code=409)


class DuplicateError(ApplicationException):
    def __init__(self, message: str):
        super().__init__(message, status_code=409)


class UnauthorizedError(ApplicationException):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status_code=401)


class InsufficientStockError(ApplicationException):
    def __init__(self, message: str):
        super().__init__(message, status_code=422)


class InvalidCredentialsError(ApplicationException):
    def __init__(self, message: str = "Invalid email or password"):
        super().__init__(message, status_code=401)
