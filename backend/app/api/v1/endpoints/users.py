from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.db.session import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    _current_user=Depends(require_admin),
):
    service = UserService(db)
    return service.get_all_users(skip=skip, limit=limit)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db), _current_user=Depends(get_current_user)):
    service = UserService(db)
    return service.get_user_by_id(user_id)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    service = UserService(db)
    return service.update_user(user_id, user_update)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: Session = Depends(get_db), _current_user=Depends(get_current_user)):
    service = UserService(db)
    service.delete_user(user_id)
