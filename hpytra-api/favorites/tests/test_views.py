import json
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accommodations.tests.factories import HotelFactory
from favorites.models import Favorite


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
        username="favoriteuser",
        email="favorite@example.com",
        password="testpass123",
    )


@pytest.mark.django_db
class TestFavoriteAPIView:
    def test_returns_only_current_user_favorites(self, api_client, test_user):
        other_user = User.objects.create_user(
            username="otheruser",
            email="other@example.com",
            password="testpass123",
        )

        hotel_1 = HotelFactory(slug="favorite-list-hotel-1")
        hotel_2 = HotelFactory(slug="favorite-list-hotel-2")
        hotel_3 = HotelFactory(slug="favorite-list-hotel-3")

        Favorite.objects.create(user=test_user, hotel=hotel_1)
        Favorite.objects.create(user=test_user, hotel=hotel_2)
        Favorite.objects.create(user=other_user, hotel=hotel_3)

        api_client.force_authenticate(user=test_user)
        response = api_client.get("/api/favorites/")
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert [item["slug"] for item in payload["data"]["results"]] == [
            hotel_2.slug,
            hotel_1.slug,
        ]

    def test_returns_401_for_unauthenticated_request(self, api_client):
        response = api_client.get("/api/favorites/")
        payload = get_payload(response)

        assert response.status_code == 401
        assert payload["success"] is False
        assert payload["error"]["status"] == 401

    def test_returns_first_page_of_paginated_favorites(self, api_client, test_user):
        hotels = [HotelFactory(slug=f"favorite-page-1-hotel-{i}") for i in range(1, 31)]

        for hotel in hotels:
            Favorite.objects.create(user=test_user, hotel=hotel)

        api_client.force_authenticate(user=test_user)
        response = api_client.get("/api/favorites/")
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert payload["data"]["count"] == 30
        assert payload["data"]["previous"] is None
        assert payload["data"]["next"] is not None
        assert len(payload["data"]["results"]) == 24

        expected_slugs = [hotel.slug for hotel in reversed(hotels)][0:24]
        assert [item["slug"] for item in payload["data"]["results"]] == expected_slugs

    def test_returns_second_page_of_paginated_favorites(self, api_client, test_user):
        hotels = [HotelFactory(slug=f"favorite-page-2-hotel-{i}") for i in range(1, 31)]

        for hotel in hotels:
            Favorite.objects.create(user=test_user, hotel=hotel)

        api_client.force_authenticate(user=test_user)
        response = api_client.get("/api/favorites/?page=2")
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert payload["data"]["count"] == 30
        assert payload["data"]["next"] is None
        assert payload["data"]["previous"] is not None
        assert len(payload["data"]["results"]) == 6

        expected_slugs = [hotel.slug for hotel in reversed(hotels)][24:]
        assert [item["slug"] for item in payload["data"]["results"]] == expected_slugs


@pytest.mark.django_db
class TestFavoriteToggleAPIView:
    def test_creates_favorite_for_authenticated_user(self, api_client, test_user):
        hotel = HotelFactory(slug="favorite-toggle-create")

        api_client.force_authenticate(user=test_user)
        response = api_client.post(f"/api/favorites/toggle/{hotel.slug}/")

        assert response.status_code == 204
        assert Favorite.objects.filter(user=test_user, hotel=hotel).exists()

    def test_does_not_create_duplicate_favorite(self, api_client, test_user):
        hotel = HotelFactory(slug="favorite-toggle-duplicate")

        api_client.force_authenticate(user=test_user)

        response_1 = api_client.post(f"/api/favorites/toggle/{hotel.slug}/")
        response_2 = api_client.post(f"/api/favorites/toggle/{hotel.slug}/")

        assert response_1.status_code == 204
        assert response_2.status_code == 204
        assert Favorite.objects.filter(user=test_user, hotel=hotel).count() == 1

    def test_deletes_favorite(self, api_client, test_user):
        hotel = HotelFactory(slug="favorite-toggle-delete")
        Favorite.objects.create(user=test_user, hotel=hotel)

        api_client.force_authenticate(user=test_user)
        response = api_client.delete(f"/api/favorites/toggle/{hotel.slug}/")

        assert response.status_code == 204
        assert Favorite.objects.filter(user=test_user, hotel=hotel).exists() is False

    def test_returns_204_when_deleting_nonexistent_favorite(
        self, api_client, test_user
    ):
        hotel = HotelFactory(slug="favorite-toggle-delete-missing")

        api_client.force_authenticate(user=test_user)
        response = api_client.delete(f"/api/favorites/toggle/{hotel.slug}/")

        assert response.status_code == 204

    def test_returns_401_for_unauthenticated_toggle_request(self, api_client):
        hotel = HotelFactory(slug="favorite-toggle-unauthenticated")

        response = api_client.post(f"/api/favorites/toggle/{hotel.slug}/")
        payload = get_payload(response)

        assert response.status_code == 401
        assert payload["success"] is False
        assert payload["error"]["status"] == 401


@pytest.mark.django_db
class TestFavoriteStatusByHotelsAPIView:
    def test_returns_empty_list_for_unauthenticated_request(self, api_client):
        response = api_client.post(
            "/api/favorites/status/by-hotels/",
            {"hotel_slugs": ["hotel-1", "hotel-2"]},
            format="json",
        )
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert payload["data"] == []

    def test_returns_400_when_hotel_slugs_exceed_limit(self, api_client, test_user):
        api_client.force_authenticate(user=test_user)

        hotel_slugs = [f"hotel-{i}" for i in range(101)]

        response = api_client.post(
            "/api/favorites/status/by-hotels/",
            {"hotel_slugs": hotel_slugs},
            format="json",
        )

        assert response.status_code == 400

    def test_returns_empty_list_for_empty_hotel_slugs(self, api_client, test_user):
        api_client.force_authenticate(user=test_user)

        response = api_client.post(
            "/api/favorites/status/by-hotels/",
            {"hotel_slugs": []},
            format="json",
        )
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert payload["data"] == []

    def test_returns_empty_list_for_non_list_hotel_slugs(self, api_client, test_user):
        api_client.force_authenticate(user=test_user)

        response = api_client.post(
            "/api/favorites/status/by-hotels/",
            {"hotel_slugs": "hotel-1"},
            format="json",
        )
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert payload["data"] == []

    def test_returns_favorited_hotel_slugs_for_authenticated_user(
        self, api_client, test_user
    ):
        hotel_1 = HotelFactory(slug="favorite-status-hotel-1")
        hotel_2 = HotelFactory(slug="favorite-status-hotel-2")
        hotel_3 = HotelFactory(slug="favorite-status-hotel-3")

        Favorite.objects.create(user=test_user, hotel=hotel_1)
        Favorite.objects.create(user=test_user, hotel=hotel_3)

        api_client.force_authenticate(user=test_user)
        response = api_client.post(
            "/api/favorites/status/by-hotels/",
            {
                "hotel_slugs": [
                    hotel_1.slug,
                    hotel_2.slug,
                    hotel_3.slug,
                ]
            },
            format="json",
        )
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert set(payload["data"]) == {hotel_1.slug, hotel_3.slug}
