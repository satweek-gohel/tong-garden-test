from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_verified_user
from app.db.session import get_db
from app.schemas.product import (
    CategoryCreate,
    CategoryResponse,
    ProductCreate,
    ProductResponse,
    ProductUpdate,
    StockUpdate,
)
from app.services.product_service import CategoryService, ProductService

router = APIRouter(prefix="/products", tags=["products"])
categories_router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[ProductResponse])
async def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category_id: int | None = None,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    service = ProductService(db)
    return service.get_all_products(skip=skip, limit=limit, category_id=category_id)


@router.get("/search", response_model=list[ProductResponse])
async def search_products(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    service = ProductService(db)
    return service.search_products(q)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db), _current_user=Depends(get_current_user)):
    service = ProductService(db)
    return service.get_product_by_id(product_id)


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate, db: Session = Depends(get_db), _current_user=Depends(require_verified_user)
):
    service = ProductService(db)
    return service.create_product(product_in)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    service = ProductService(db)
    return service.update_product(product_id, product_update)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int, db: Session = Depends(get_db), _current_user=Depends(get_current_user)):
    service = ProductService(db)
    service.delete_product(product_id)


@router.patch("/{product_id}/stock", response_model=ProductResponse)
async def update_stock(
    product_id: int,
    stock_update: StockUpdate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    service = ProductService(db)
    return service.update_stock(product_id, stock_update.quantity_change, stock_update.reason)


@categories_router.get("", response_model=list[CategoryResponse])
async def list_categories(db: Session = Depends(get_db), _current_user=Depends(get_current_user)):
    service = CategoryService(db)
    return service.get_all()


@categories_router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_in: CategoryCreate, db: Session = Depends(get_db), _current_user=Depends(get_current_user)
):
    service = CategoryService(db)
    return service.create(category_in)
