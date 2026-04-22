import json
import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch
from django.contrib.auth import get_user_model


User = get_user_model()


# 將經過統一回傳格式化的 response content 轉成 Python dict
def get_payload(response):
    return json.loads(response.content)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def test_user(db):
    return User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="testpass123",
    )


@pytest.mark.django_db
class TestMeView:
    def test_returns_current_user_for_authenticated_request(
        self, api_client, test_user
    ):
        api_client.force_authenticate(user=test_user)

        response = api_client.get("/api/auth/me/")
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert payload["data"]["id"] == str(test_user.id)
        assert payload["data"]["username"] == test_user.username
        assert payload["data"]["email"] == test_user.email

    def test_rejects_unauthenticated_request(self, api_client):
        response = api_client.get("/api/auth/me/")
        payload = get_payload(response)

        assert response.status_code == 401
        assert payload["success"] is False
        assert payload["error"]["status"] == 401


@pytest.mark.django_db
class TestRegisterView:
    @patch("accounts.views.require_turnstile")
    def test_registers_201_and_creates_user(self, mock_require_turnstile, api_client):
        response = api_client.post(
            "/api/auth/register/",
            {
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "testpass123",
                "password2": "testpass123",
            },
            format="json",
        )
        payload = get_payload(response)

        assert response.status_code == 201
        assert payload["success"] is True
        assert payload["data"]["username"] == "newuser"
        assert payload["data"]["email"] == "newuser@example.com"
        assert User.objects.filter(
            username="newuser", email="newuser@example.com"
        ).exists()

        mock_require_turnstile.assert_called_once()

    @patch("accounts.views.require_turnstile")
    def test_returns_400_for_duplicate_email_or_username(
        self, mock_require_turnstile, api_client, test_user
    ):
        response = api_client.post(
            "/api/auth/register/",
            {
                "username": test_user.username,
                "email": test_user.email,
                "password": "testpass123",
                "password2": "testpass123",
            },
            format="json",
        )
        payload = get_payload(response)

        assert response.status_code == 400
        assert payload["success"] is False
        assert payload["error"]["status"] == 400

        mock_require_turnstile.assert_called_once()

    @patch("accounts.views.require_turnstile")
    def test_returns_400_for_mismatched_passwords(
        self, mock_require_turnstile, api_client
    ):
        response = api_client.post(
            "/api/auth/register/",
            {
                "username": "newuser2",
                "email": "newuser2@example.com",
                "password": "testpass123",
                "password2": "differentpass123",
            },
            format="json",
        )
        payload = get_payload(response)

        assert response.status_code == 400
        assert payload["success"] is False
        assert payload["error"]["status"] == 400

        mock_require_turnstile.assert_called_once()


@pytest.mark.django_db
class TestLoginView:
    @patch("accounts.views.require_turnstile")
    def test_logs_in_and_sets_auth_cookies(
        self, mock_require_turnstile, api_client, test_user
    ):
        response = api_client.post(
            "/api/auth/login/",
            {
                "identifier": test_user.username,
                "password": "testpass123",
            },
            format="json",
        )
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert payload["data"]["user"]["id"] == str(test_user.id)
        assert payload["data"]["user"]["username"] == test_user.username
        assert payload["data"]["user"]["email"] == test_user.email

        assert "hpytra_access" in response.cookies
        assert "hpytra_refresh" in response.cookies

        mock_require_turnstile.assert_called_once()

    @patch("accounts.views.require_turnstile")
    def test_returns_400_for_invalid_identifier(
        self, mock_require_turnstile, api_client
    ):
        response = api_client.post(
            "/api/auth/login/",
            {
                "identifier": "not-exist-user",
                "password": "testpass123",
            },
            format="json",
        )
        payload = get_payload(response)

        assert response.status_code == 400
        assert payload["success"] is False
        assert payload["error"]["status"] == 400

        mock_require_turnstile.assert_called_once()

    @patch("accounts.views.require_turnstile")
    def test_returns_400_for_invalid_password(
        self, mock_require_turnstile, api_client, test_user
    ):
        response = api_client.post(
            "/api/auth/login/",
            {
                "identifier": test_user.username,
                "password": "wrongpassword",
            },
            format="json",
        )
        payload = get_payload(response)

        assert response.status_code == 400
        assert payload["success"] is False
        assert payload["error"]["status"] == 400

        mock_require_turnstile.assert_called_once()


@pytest.mark.django_db
class TestLogoutView:
    def test_returns_204_and_clears_auth_cookies(self, api_client):
        response = api_client.post("/api/auth/logout/")

        assert response.status_code == 204
        assert "hpytra_access" in response.cookies
        assert "hpytra_refresh" in response.cookies
        assert response.cookies["hpytra_access"].value == ""
        assert response.cookies["hpytra_refresh"].value == ""


@pytest.mark.django_db
class TestRefreshView:
    def test_returns_401_for_missing_refresh_token(self, api_client):
        response = api_client.post("/api/auth/refresh/")
        payload = get_payload(response)

        assert response.status_code == 401
        assert payload["success"] is False
        assert payload["message"] == "No refresh token"
        assert payload["error"]["status"] == 401

    def test_returns_401_for_invalid_refresh_token(self, api_client):
        api_client.cookies["hpytra_refresh"] = "invalid-token"

        response = api_client.post("/api/auth/refresh/")
        payload = get_payload(response)

        assert response.status_code == 401
        assert payload["success"] is False
        assert payload["message"] == "Invalid refresh token"
        assert payload["error"]["status"] == 401

    def test_returns_200_for_valid_refresh_token(self, api_client, test_user):
        refresh_token = str(RefreshToken.for_user(test_user))
        api_client.cookies["hpytra_refresh"] = refresh_token

        response = api_client.post("/api/auth/refresh/")
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert payload["data"]["user"]["id"] == str(test_user.id)
        assert payload["data"]["user"]["username"] == test_user.username
        assert payload["data"]["user"]["email"] == test_user.email
        assert "hpytra_access" in response.cookies


@pytest.mark.django_db
class TestChangePasswordView:
    def test_returns_200_and_changes_password(self, api_client, test_user):
        api_client.force_authenticate(user=test_user)

        response = api_client.post(
            "/api/auth/change-password/",
            {
                "current_password": "testpass123",
                "new_password": "newpass123",
                "new_password2": "newpass123",
            },
            format="json",
        )

        assert response.status_code == 200

        test_user.refresh_from_db()
        assert test_user.check_password("newpass123") is True

    def test_returns_400_for_invalid_current_password(self, api_client, test_user):
        api_client.force_authenticate(user=test_user)

        response = api_client.post(
            "/api/auth/change-password/",
            {
                "current_password": "wrongpassword",
                "new_password": "newpass123",
            },
            format="json",
        )
        payload = get_payload(response)

        assert response.status_code == 400
        assert payload["success"] is False
        assert payload["error"]["status"] == 400

    def test_returns_401_for_unauthenticated_request(self, api_client):
        response = api_client.post(
            "/api/auth/change-password/",
            {
                "current_password": "testpass123",
                "new_password": "newpass123",
            },
            format="json",
        )
        payload = get_payload(response)

        assert response.status_code == 401
        assert payload["success"] is False
        assert payload["error"]["status"] == 401
