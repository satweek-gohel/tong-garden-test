from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import DuplicateError, NotFoundError
from app.models.order import InventoryLog
from app.models.product import Category, Product
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    def __init__(self, db: Session):
        self.db = db

    def get_product_by_id(self, product_id: int) -> Product:
        product = self.db.query(Product).filter(
            Product.id == product_id, Product.is_active == True
        ).first()
        if not product:
            raise NotFoundError(f"Product {product_id} not found")
        return product

    def get_all_products(self, skip: int = 0, limit: int = 10, category_id: int | None = None) -> list[Product]:
        query = self.db.query(Product).filter(Product.is_active == True)
        if category_id:
            query = query.filter(Product.category_id == category_id)
        return query.offset(skip).limit(limit).all()

    def create_product(self, product_in: ProductCreate) -> Product:
        if not self.db.query(Category).filter(Category.id == product_in.category_id).first():
            raise NotFoundError(f"Category {product_in.category_id} not found")
        try:
            db_product = Product(
                sku=product_in.sku,
                name=product_in.name,
                description=product_in.description,
                price=product_in.price,
                cost=product_in.cost,
                stock_quantity=product_in.stock_quantity,
                category_id=product_in.category_id,
                manufacturer=product_in.manufacturer,
                is_active=True,
            )
            self.db.add(db_product)
            self.db.commit()
            self.db.refresh(db_product)
            return db_product
        except IntegrityError as exc:
            self.db.rollback()
            raise DuplicateError(f"SKU {product_in.sku} already exists") from exc

    def update_product(self, product_id: int, product_update: ProductUpdate) -> Product:
        db_product = self.get_product_by_id(product_id)

        for field, value in product_update.model_dump(exclude_unset=True).items():
            setattr(db_product, field, value)

        self.db.add(db_product)
        self.db.commit()
        self.db.refresh(db_product)
        return db_product

    def delete_product(self, product_id: int) -> bool:
        db_product = self.get_product_by_id(product_id)
        db_product.is_active = False
        self.db.add(db_product)
        self.db.commit()
        return True

    def search_products(self, query: str) -> list[Product]:
        return self.db.query(Product).filter(
            Product.is_active == True,
            (Product.name.ilike(f"%{query}%") | Product.description.ilike(f"%{query}%")),
        ).all()

    def update_stock(self, product_id: int, quantity_change: int, reason: str | None = None) -> Product:
        db_product = self.get_product_by_id(product_id)
        previous_quantity = db_product.stock_quantity
        db_product.stock_quantity += quantity_change

        log = InventoryLog(
            product_id=product_id,
            transaction_type="adjustment",
            quantity_change=quantity_change,
            previous_quantity=previous_quantity,
            new_quantity=db_product.stock_quantity,
            reason=reason,
        )

        self.db.add(db_product)
        self.db.add(log)
        self.db.commit()
        self.db.refresh(db_product)
        return db_product


class CategoryService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Category]:
        return self.db.query(Category).filter(Category.is_active == True).all()

    def create(self, data) -> Category:
        try:
            category = Category(**data.model_dump())
            self.db.add(category)
            self.db.commit()
            self.db.refresh(category)
            return category
        except IntegrityError as exc:
            self.db.rollback()
            raise DuplicateError(f"Category {data.name} already exists") from exc
