from sqlalchemy import (
    DECIMAL,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    status = Column(String(50), default="pending", index=True)
    total_amount = Column(DECIMAL(12, 2), nullable=False, default=0)
    shipping_address = Column(Text)
    billing_address = Column(Text)
    payment_method = Column(String(50))
    payment_status = Column(String(50), default="pending", index=True)
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now(), index=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("total_amount >= 0", name="ck_orders_total_nonneg"),
        Index("idx_orders_user_id", "user_id"),
        Index("idx_orders_status", "status"),
    )

    def __repr__(self) -> str:
        return f"<Order {self.order_number}>"


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), index=True, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(DECIMAL(10, 2), nullable=False)
    subtotal = Column(DECIMAL(12, 2), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    order = relationship("Order", back_populates="order_items")
    product = relationship("Product", back_populates="order_items")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_order_items_qty_positive"),
        CheckConstraint("unit_price > 0", name="ck_order_items_price_positive"),
    )


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), index=True, nullable=False)
    amount = Column(DECIMAL(12, 2), nullable=False)
    currency = Column(String(3), default="USD")
    payment_method = Column(String(50))
    payment_gateway = Column(String(50))
    transaction_id = Column(String(255), index=True)
    status = Column(String(50), default="pending", index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    order = relationship("Order", back_populates="payments")

    __table_args__ = (
        CheckConstraint("amount > 0", name="ck_payments_amount_positive"),
    )


class InventoryLog(Base):
    __tablename__ = "inventory_logs"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), index=True, nullable=False)
    transaction_type = Column(String(50), nullable=False)
    quantity_change = Column(Integer, nullable=False)
    previous_quantity = Column(Integer)
    new_quantity = Column(Integer)
    reason = Column(String(255))
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now(), index=True)

    product = relationship("Product", back_populates="inventory_logs")
    created_by_user = relationship("User", back_populates="inventory_logs")
