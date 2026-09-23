from fastapi import status


class TestAuthAndUsers:
    def test_register_user_success(self, client):
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@tonggarden.com",
                "full_name": "New User",
                "password": "SecurePass123",
            },
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == "newuser@tonggarden.com"
        assert "password" not in data
        assert "password_hash" not in data
        assert data["role"] == "user"

    def test_register_as_admin_when_selected(self, client):
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "admin@tonggarden.com",
                "full_name": "Admin User",
                "password": "SecurePass123",
                "role": "admin",
            },
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json()["role"] == "admin"

    def test_register_rejects_invalid_role(self, client):
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "bad@tonggarden.com",
                "full_name": "Bad Role",
                "password": "SecurePass123",
                "role": "superuser",
            },
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_duplicate_email(self, client, sample_user):
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": sample_user.email,
                "full_name": "Another User",
                "password": "SecurePass123",
            },
        )
        assert response.status_code == status.HTTP_409_CONFLICT

    def test_register_weak_password(self, client):
        response = client.post(
            "/api/v1/auth/register",
            json={"email": "test@tonggarden.com", "full_name": "Test", "password": "weak"},
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_login_success_sets_httponly_cookies(self, client, sample_user):
        response = client.post(
            "/api/v1/auth/login",
            json={"email": sample_user.email, "password": "TestPass123"},
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["email"] == sample_user.email

        assert "access_token" not in response.text
        assert "refresh_token" not in response.text
        assert "access_token" in response.cookies
        assert "refresh_token" in response.cookies

    def test_login_invalid_credentials(self, client, sample_user):
        response = client.post(
            "/api/v1/auth/login",
            json={"email": sample_user.email, "password": "WrongPass"},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_rate_limited_after_too_many_failures(self, client, sample_user):
        for _ in range(5):
            client.post(
                "/api/v1/auth/login",
                json={"email": sample_user.email, "password": "WrongPass"},
            )

        response = client.post(
            "/api/v1/auth/login",
            json={"email": sample_user.email, "password": "WrongPass"},
        )
        assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS

    def test_get_user_requires_auth(self, client, sample_user):
        response = client.get(f"/api/v1/users/{sample_user.id}")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_user_by_id(self, client, sample_user, auth_headers):
        response = client.get(f"/api/v1/users/{sample_user.id}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["id"] == sample_user.id

    def test_get_user_not_found(self, client, auth_headers):
        response = client.get("/api/v1/users/99999", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_user(self, client, sample_user, auth_headers):
        response = client.put(
            f"/api/v1/users/{sample_user.id}",
            json={"full_name": "Updated Name"},
            headers=auth_headers,
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["full_name"] == "Updated Name"

    def test_delete_user(self, client, sample_user, auth_headers):
        response = client.delete(f"/api/v1/users/{sample_user.id}", headers=auth_headers)
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_regular_user_cannot_list_users(self, client, auth_headers):
        response = client.get("/api/v1/users", headers=auth_headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_can_list_users(self, client, admin_headers):
        response = client.get("/api/v1/users", headers=admin_headers)
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)
