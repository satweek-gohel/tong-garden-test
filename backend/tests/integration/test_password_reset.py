from fastapi import status


class TestPasswordReset:
    def test_forgot_password_returns_dev_otp_in_debug(self, client, sample_user, monkeypatch):
        monkeypatch.setattr("app.services.auth_service.settings.DEBUG", True)

        response = client.post("/api/v1/auth/forgot-password", json={"email": sample_user.email})
        assert response.status_code == status.HTTP_200_OK
        dev_otp = response.json()["dev_otp"]
        assert dev_otp is not None
        assert len(dev_otp) == 6
        assert dev_otp.isdigit()

    def test_forgot_password_never_reveals_whether_email_exists(self, client, monkeypatch):
        monkeypatch.setattr("app.services.auth_service.settings.DEBUG", True)

        response = client.post("/api/v1/auth/forgot-password", json={"email": "nobody@tonggarden.com"})
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["dev_otp"] is None

    def test_reset_password_with_valid_otp_changes_password(self, client, sample_user, monkeypatch):
        monkeypatch.setattr("app.services.auth_service.settings.DEBUG", True)

        forgot_response = client.post("/api/v1/auth/forgot-password", json={"email": sample_user.email})
        otp = forgot_response.json()["dev_otp"]

        reset_response = client.post(
            "/api/v1/auth/reset-password",
            json={
                "email": sample_user.email,
                "otp": otp,
                "new_password": "BrandNewPass123",
                "confirm_password": "BrandNewPass123",
            },
        )
        assert reset_response.status_code == status.HTTP_200_OK

        old_login = client.post(
            "/api/v1/auth/login", json={"email": sample_user.email, "password": "TestPass123"}
        )
        assert old_login.status_code == status.HTTP_401_UNAUTHORIZED

        new_login = client.post(
            "/api/v1/auth/login", json={"email": sample_user.email, "password": "BrandNewPass123"}
        )
        assert new_login.status_code == status.HTTP_200_OK

    def test_reset_password_rejects_mismatched_confirmation(self, client, sample_user, monkeypatch):
        monkeypatch.setattr("app.services.auth_service.settings.DEBUG", True)

        forgot_response = client.post("/api/v1/auth/forgot-password", json={"email": sample_user.email})
        otp = forgot_response.json()["dev_otp"]

        response = client.post(
            "/api/v1/auth/reset-password",
            json={
                "email": sample_user.email,
                "otp": otp,
                "new_password": "BrandNewPass123",
                "confirm_password": "SomethingElse456",
            },
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_reset_password_otp_is_single_use(self, client, sample_user, monkeypatch):
        monkeypatch.setattr("app.services.auth_service.settings.DEBUG", True)

        forgot_response = client.post("/api/v1/auth/forgot-password", json={"email": sample_user.email})
        otp = forgot_response.json()["dev_otp"]

        first = client.post(
            "/api/v1/auth/reset-password",
            json={
                "email": sample_user.email,
                "otp": otp,
                "new_password": "FirstNewPass123",
                "confirm_password": "FirstNewPass123",
            },
        )
        assert first.status_code == status.HTTP_200_OK

        replay = client.post(
            "/api/v1/auth/reset-password",
            json={
                "email": sample_user.email,
                "otp": otp,
                "new_password": "SecondNewPass123",
                "confirm_password": "SecondNewPass123",
            },
        )
        assert replay.status_code == status.HTTP_401_UNAUTHORIZED

    def test_reset_password_with_wrong_otp_rejected(self, client, sample_user, monkeypatch):
        monkeypatch.setattr("app.services.auth_service.settings.DEBUG", True)
        client.post("/api/v1/auth/forgot-password", json={"email": sample_user.email})

        response = client.post(
            "/api/v1/auth/reset-password",
            json={
                "email": sample_user.email,
                "otp": "000000",
                "new_password": "Whatever123",
                "confirm_password": "Whatever123",
            },
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_reset_password_for_unknown_email_rejected(self, client):
        response = client.post(
            "/api/v1/auth/reset-password",
            json={
                "email": "nobody@tonggarden.com",
                "otp": "123456",
                "new_password": "Whatever123",
                "confirm_password": "Whatever123",
            },
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_reset_password_revokes_existing_sessions(self, client, sample_user, monkeypatch):
        monkeypatch.setattr("app.services.auth_service.settings.DEBUG", True)

        client.post("/api/v1/auth/login", json={"email": sample_user.email, "password": "TestPass123"})

        forgot_response = client.post("/api/v1/auth/forgot-password", json={"email": sample_user.email})
        otp = forgot_response.json()["dev_otp"]
        client.post(
            "/api/v1/auth/reset-password",
            json={
                "email": sample_user.email,
                "otp": otp,
                "new_password": "BrandNewPass123",
                "confirm_password": "BrandNewPass123",
            },
        )

        refresh_response = client.post("/api/v1/auth/refresh")
        assert refresh_response.status_code == status.HTTP_401_UNAUTHORIZED
