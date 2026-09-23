from sqlalchemy.orm import Session

from app.core.exceptions import InsufficientStockError, NotFoundError
from app.models.order import Order, OrderItem, Payment
from app.models.product import Product
from app.schemas.order import OrderCreate


class OrderService:
    def __init__(self, db: Session):
        self.db = db

    def generate_order_number(self) -> str:
        latest_order = self.db.query(Order).order_by(Order.id.desc()).first()
        order_id = (latest_order.id + 1) if latest_order else 1
        return f"TG-{order_id:06d}"

    def get_order_by_id(self, order_id: int) -> Order:
        order = self.db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise NotFoundError(f"Order {order_id} not found")
        return order

    def get_all_orders(self, skip: int = 0, limit: int = 10, status: str | None = None) -> list[Order]:
        query = self.db.query(Order)
        if status:
            query = query.filter(Order.status == status)
        return query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    def create_order(self, order_in: OrderCreate) -> Order:
        db_order = Order(
            order_number=self.generate_order_number(),
            user_id=order_in.user_id,
            status="pending",
            total_amount=0,
            payment_status="pending",
            shipping_address=order_in.shipping_address,
            billing_address=order_in.billing_address,
            notes=order_in.notes,
        )
        self.db.add(db_order)
        self.db.commit()
        self.db.refresh(db_order)
        return db_order

    def add_order_item(self, order_id: int, product_id: int, quantity: int) -> OrderItem:
        order = self.get_order_by_id(order_id)
        product = self.db.query(Product).filter(Product.id == product_id).first()

        if not product:
            raise NotFoundError(f"Product {product_id} not found")
        if product.stock_quantity < quantity:
            raise InsufficientStockError(f"Insufficient stock for product {product.name}")

        subtotal = product.price * quantity
        order_item = OrderItem(
            order_id=order_id,
            product_id=product_id,
            quantity=quantity,
            unit_price=product.price,
            subtotal=subtotal,
        )

        order.total_amount += subtotal
        product.stock_quantity -= quantity

        self.db.add(order_item)
        self.db.add(order)
        self.db.add(product)
        self.db.commit()
        self.db.refresh(order_item)
        return order_item

    def update_order_status(self, order_id: int, status: str) -> Order:
        order = self.get_order_by_id(order_id)
        order.status = status
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order

    def process_payment(self, order_id: int, amount, payment_method: str) -> dict:
        order = self.get_order_by_id(order_id)

        if amount != order.total_amount:
            return {"status": "failed", "order_id": order.id, "amount": amount}

        payment = Payment(
            order_id=order_id,
            amount=amount,
            payment_method=payment_method,
            status="completed",
        )
        order.payment_status = "completed"
        order.payment_method = payment_method
        order.status = "confirmed"

        self.db.add(payment)
        self.db.add(order)
        self.db.commit()

        return {"status": "success", "order_id": order.id, "amount": amount}

    def delete_order(self, order_id: int) -> bool:
        order = self.get_order_by_id(order_id)

        for item in order.order_items:
            product = self.db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.stock_quantity += item.quantity
                self.db.add(product)

        self.db.delete(order)
        self.db.commit()
        return True
