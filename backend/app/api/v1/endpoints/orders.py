from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_verified_user
from app.db.session import get_db
from app.schemas.order import (
    OrderCreate,
    OrderItemCreate,
    OrderItemResponse,
    OrderResponse,
    OrderStatusUpdate,
    PaymentCreate,
    PaymentResponse,
)
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("", response_model=list[OrderResponse])
async def list_orders(
    skip: int = 0,
    limit: int = 10,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    service = OrderService(db)
    return service.get_all_orders(skip=skip, limit=limit, status=status_filter)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: Session = Depends(get_db), _current_user=Depends(get_current_user)):
    service = OrderService(db)
    return service.get_order_by_id(order_id)


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate, db: Session = Depends(get_db), _current_user=Depends(require_verified_user)
):
    service = OrderService(db)
    return service.create_order(order_in)


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    order_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    service = OrderService(db)
    return service.update_order_status(order_id, order_update.status)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(order_id: int, db: Session = Depends(get_db), _current_user=Depends(get_current_user)):
    service = OrderService(db)
    service.delete_order(order_id)


@router.post("/{order_id}/items", response_model=OrderItemResponse, status_code=status.HTTP_201_CREATED)
async def add_order_item(
    order_id: int,
    item_in: OrderItemCreate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    service = OrderService(db)
    return service.add_order_item(order_id, item_in.product_id, item_in.quantity)


@router.post("/{order_id}/payment", response_model=PaymentResponse)
async def process_payment(
    order_id: int,
    payment_in: PaymentCreate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    service = OrderService(db)
    return service.process_payment(order_id, payment_in.amount, payment_in.payment_method)
