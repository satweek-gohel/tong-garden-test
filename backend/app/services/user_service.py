from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import DuplicateEmailError, UserNotFoundError
from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_id(self, user_id: int) -> User:
        user = self.db.query(User).filter(User.id == user_id, User.is_active == True).first()
        if not user:
            raise UserNotFoundError(f"User {user_id} not found")
        return user

    def get_all_users(self, skip: int = 0, limit: int = 10) -> list[User]:
        return self.db.query(User).filter(User.is_active == True).offset(skip).limit(limit).all()

    def create_user(self, user_in: UserCreate) -> User:
        try:
            db_user = User(
                email=user_in.email,
                full_name=user_in.full_name,
                password_hash=hash_password(user_in.password),
                is_active=True,
                role=user_in.role,
            )
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)
            return db_user
        except IntegrityError as exc:
            self.db.rollback()
            raise DuplicateEmailError(f"Email {user_in.email} already exists") from exc

    def update_user(self, user_id: int, user_update: UserUpdate) -> User:
        db_user = self.get_user_by_id(user_id)

        if user_update.full_name is not None:
            db_user.full_name = user_update.full_name
        if user_update.phone is not None:
            db_user.phone = user_update.phone
        if user_update.password is not None:
            db_user.password_hash = hash_password(user_update.password)

        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def delete_user(self, user_id: int) -> bool:
        db_user = self.get_user_by_id(user_id)
        db_user.is_active = False
        self.db.add(db_user)
        self.db.commit()
        return True
