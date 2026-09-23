from fastapi import status


class TestAuthFlow:
    def test_login_then_refresh_issues_new_access_token(self, client, sample_user):
        client.post(
            "/api/v1/auth/login",
            json={"email": sample_user.email, "password": "TestPass123"},
        )

        refresh_response = client.post("/api/v1/auth/refresh")
        assert refresh_response.status_code == status.HTTP_200_OK
        assert refresh_response.json()["email"] == sample_user.email
        assert "access_token" in refresh_response.cookies

        me_response = client.get("/api/v1/auth/me")
        assert me_response.status_code == status.HTTP_200_OK
        assert me_response.json()["email"] == sample_user.email

    def test_refresh_rotates_token_so_the_old_one_cannot_be_reused(self, client, sample_user):
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": sample_user.email, "password": "TestPass123"},
        )
        old_refresh_token = login_response.cookies["refresh_token"]

        first_refresh = client.post("/api/v1/auth/refresh")
        assert first_refresh.status_code == status.HTTP_200_OK

        client.cookies.set("refresh_token", old_refresh_token)
        replayed_refresh = client.post("/api/v1/auth/refresh")
        assert replayed_refresh.status_code == status.HTTP_401_UNAUTHORIZED

    def test_logout_invalidates_the_refresh_token(self, client, sample_user):
        client.post(
            "/api/v1/auth/login",
            json={"email": sample_user.email, "password": "TestPass123"},
        )

        logout_response = client.post("/api/v1/auth/logout")
        assert logout_response.status_code == status.HTTP_204_NO_CONTENT

        refresh_response = client.post("/api/v1/auth/refresh")
        assert refresh_response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_refresh_without_a_cookie_is_rejected(self, client):
        response = client.post("/api/v1/auth/refresh")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_me_endpoint_reflects_the_logged_in_user(self, client, sample_user):
        client.post(
            "/api/v1/auth/login",
            json={"email": sample_user.email, "password": "TestPass123"},
        )

        response = client.get("/api/v1/auth/me")
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["email"] == sample_user.email
