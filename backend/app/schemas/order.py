from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    subtotal: Decimal
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    user_id: int
    shipping_address: str | None = None
    billing_address: str | None = None
    notes: str | None = None


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., min_length=1)


class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: int
    status: str
    total_amount: Decimal
    shipping_address: str | None = None
    billing_address: str | None = None
    payment_method: str | None = None
    payment_status: str
    notes: str | None = None
    order_items: list[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaymentCreate(BaseModel):
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    payment_method: str


class PaymentResponse(BaseModel):
    status: str
    order_id: int
    amount: Decimal
