from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None


class CategoryCreate(CategoryBase):
    parent_category_id: int | None = None


class CategoryResponse(CategoryBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    sku: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    price: Decimal = Field(..., gt=0, decimal_places=2)
    cost: Decimal | None = Field(None, gt=0, decimal_places=2)
    stock_quantity: int = Field(default=0, ge=0)
    category_id: int


class ProductCreate(ProductBase):
    manufacturer: str | None = None


class ProductUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    price: Decimal | None = Field(None, gt=0, decimal_places=2)
    cost: Decimal | None = Field(None, gt=0, decimal_places=2)
    stock_quantity: int | None = Field(None, ge=0)
    category_id: int | None = None


class ProductResponse(ProductBase):
    id: int
    manufacturer: str | None = None
    reorder_level: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StockUpdate(BaseModel):
    quantity_change: int
    reason: str | None = None
