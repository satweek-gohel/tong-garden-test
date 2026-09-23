from fastapi import status


class TestEmailVerification:
    def test_new_users_start_unverified(self, client):
        response = client.post(
            "/api/v1/auth/register",
            json={"email": "fresh@tonggarden.com", "full_name": "Fresh User", "password": "SecurePass123"},
        )
        assert response.json()["is_verified"] is False

    def test_unverified_user_cannot_create_a_product(self, client, unverified_headers, sample_category):
        response = client.post(
            "/api/v1/products",
            json={
                "sku": "SNK-099",
                "name": "Gated Product",
                "price": 1.99,
                "category_id": sample_category.id,
            },
            headers=unverified_headers,
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "verify" in response.json()["detail"].lower()

    def test_verified_user_can_create_a_product(self, client, auth_headers, sample_category):
        response = client.post(
            "/api/v1/products",
            json={
                "sku": "SNK-100",
                "name": "Allowed Product",
                "price": 1.99,
                "category_id": sample_category.id,
            },
            headers=auth_headers,
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_unverified_user_can_still_read_products(self, client, unverified_headers, sample_product):
        response = client.get("/api/v1/products", headers=unverified_headers)
        assert response.status_code == status.HTTP_200_OK

    def test_resend_verification_returns_dev_link(self, client, unverified_user, monkeypatch):
        monkeypatch.setattr("app.services.auth_service.settings.DEBUG", True)

        response = client.post(
            "/api/v1/auth/resend-verification", json={"email": unverified_user.email}
        )
        assert response.status_code == status.HTTP_200_OK
        assert "token=" in response.json()["dev_link"]

    def test_resend_verification_is_a_noop_for_already_verified_users(self, client, sample_user, monkeypatch):
        monkeypatch.setattr("app.services.auth_service.settings.DEBUG", True)

        response = client.post("/api/v1/auth/resend-verification", json={"email": sample_user.email})
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["dev_link"] is None

    def test_verify_email_with_valid_token_unlocks_write_access(
        self, client, unverified_user, sample_category, monkeypatch
    ):
        monkeypatch.setattr("app.services.auth_service.settings.DEBUG", True)

        resend_response = client.post(
            "/api/v1/auth/resend-verification", json={"email": unverified_user.email}
        )
        token = resend_response.json()["dev_link"].split("token=")[1]

        verify_response = client.post("/api/v1/auth/verify-email", json={"token": token})
        assert verify_response.status_code == status.HTTP_200_OK
        assert verify_response.json()["is_verified"] is True

        from app.core.security import create_access_token

        headers = {"Authorization": f"Bearer {create_access_token(subject=str(unverified_user.id))}"}
        create_response = client.post(
            "/api/v1/products",
            json={"sku": "SNK-101", "name": "Now Allowed", "price": 2.50, "category_id": sample_category.id},
            headers=headers,
        )
        assert create_response.status_code == status.HTTP_201_CREATED

    def test_verify_email_with_invalid_token_rejected(self, client):
        response = client.post("/api/v1/auth/verify-email", json={"token": "not-a-real-token"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_verify_email_token_is_single_use(self, client, unverified_user, monkeypatch):
        monkeypatch.setattr("app.services.auth_service.settings.DEBUG", True)

        resend_response = client.post(
            "/api/v1/auth/resend-verification", json={"email": unverified_user.email}
        )
        token = resend_response.json()["dev_link"].split("token=")[1]

        first = client.post("/api/v1/auth/verify-email", json={"token": token})
        assert first.status_code == status.HTTP_200_OK

        replay = client.post("/api/v1/auth/verify-email", json={"token": token})
        assert replay.status_code == status.HTTP_401_UNAUTHORIZED
