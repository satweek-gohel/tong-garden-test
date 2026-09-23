import os

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
os.environ["DATABASE_URL"] = SQLALCHEMY_TEST_DATABASE_URL

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

import app.models  # noqa: F401
from app.core.security import create_access_token, hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import app as fastapi_app

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db: Session):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    fastapi_app.dependency_overrides[get_db] = override_get_db

    with TestClient(fastapi_app) as test_client:
        yield test_client

    fastapi_app.dependency_overrides.clear()


@pytest.fixture
def sample_user(db: Session):
    from app.models.user import User

    user = User(
        email="test@tonggarden.com",
        full_name="Test User",
        password_hash=hash_password("TestPass123"),
        is_active=True,
        is_verified=True,
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def sample_admin(db: Session):
    from app.models.user import User

    admin = User(
        email="admin@tonggarden.com",
        full_name="Admin User",
        password_hash=hash_password("AdminPass123"),
        is_active=True,
        is_verified=True,
        role="admin",
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


@pytest.fixture
def unverified_user(db: Session):
    from app.models.user import User

    user = User(
        email="unverified@tonggarden.com",
        full_name="Unverified User",
        password_hash=hash_password("TestPass123"),
        is_active=True,
        is_verified=False,
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def sample_category(db: Session):
    from app.models.product import Category

    category = Category(name="Snacks", description="Snack food products", is_active=True)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@pytest.fixture
def sample_product(db: Session, sample_category):
    from app.models.product import Product

    product = Product(
        sku="SNK-001",
        name="Peanut Pack 100g",
        description="Test snack product",
        price=1.99,
        cost=0.80,
        stock_quantity=500,
        category_id=sample_category.id,
        manufacturer="Tong Garden",
        is_active=True,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@pytest.fixture
def auth_headers(sample_user):
    token = create_access_token(subject=str(sample_user.id))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(sample_admin):
    token = create_access_token(subject=str(sample_admin.id))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def unverified_headers(unverified_user):
    token = create_access_token(subject=str(unverified_user.id))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(autouse=True)
def _reset_login_rate_limiter():
    from app.core.rate_limit import _failed_attempts

    _failed_attempts.clear()
    yield
    _failed_attempts.clear()
