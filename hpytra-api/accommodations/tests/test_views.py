import json
import pytest
from rest_framework.test import APIClient
from datetime import timedelta
from django.utils import timezone
from accommodations.views import get_hotels_by_place_tree
from accommodations.models import PlaceDetail, Hotel, Label
from .factories import HotelFactory, PlaceFactory, PlaceDetailFactory, LabelFactory


# 將經過統一回傳格式化的 response content 轉成 Python dict
def get_payload(response):
    return json.loads(response.content)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestLabelsByPlaceTreeAPIView:
    def test_returns_labels_from_place_and_child_places(self, api_client):
        parent_place = PlaceFactory(slug="parent-place")
        child_place = PlaceFactory(slug="child-place", parent_slug="parent-place")
        other_place = PlaceFactory(slug="other-place")

        label_1 = LabelFactory(slug="label-1", name="Label1", order_index=1)
        label_2 = LabelFactory(slug="label-2", name="Label2", order_index=2)
        label_3 = LabelFactory(slug="label-3", name="Label3", order_index=3)

        HotelFactory(
            place=parent_place,
            slug="parent-hotel",
            labels=["label-1"],
            is_active=True,
        )
        HotelFactory(
            place=child_place,
            slug="child-hotel",
            labels=["label-2"],
            is_active=True,
        )
        HotelFactory(
            place=other_place,
            slug="other-hotel",
            labels=["label-3"],
            is_active=True,
        )

        response = api_client.get("/api/places/parent-place/labels/")
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert {item["slug"] for item in payload["data"]} == {
            label_1.slug,
            label_2.slug,
        }

    def test_returns_empty_list_when_place_tree_has_no_labels(self, api_client):
        parent_place = PlaceFactory(slug="place-no-labels")
        child_place = PlaceFactory(
            slug="child-no-labels", parent_slug=parent_place.slug
        )

        HotelFactory(
            place=parent_place,
            slug="hotel-no-labels-1",
            labels=[],
            is_active=True,
        )
        HotelFactory(
            place=child_place,
            slug="hotel-no-labels-2",
            labels=[],
            is_active=True,
        )

        response = api_client.get(f"/api/places/{parent_place.slug}/labels/")
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert payload["data"] == []


@pytest.mark.django_db
class TestHotelDetailAPIView:
    def test_returns_hotel_detail(self, api_client):
        hotel = HotelFactory(
            slug="hotel-taipei",
            name="Hotel Taipei",
            is_active=True,
        )

        response = api_client.get(f"/api/hotels/{hotel.slug}/")
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert payload["data"]["slug"] == hotel.slug
        assert payload["data"]["name"] == hotel.name

    def test_redirects_uppercase_slug(self, api_client):
        hotel = HotelFactory(
            slug="hotel-taipei",
            is_active=True,
        )

        response = api_client.get("/api/hotels/HOTEL-TAIPEI/")

        assert response.status_code == 301
        assert response["Location"] == f"/api/hotels/{hotel.slug}/"

    def test_returns_404_for_nonexistent_slug(self, api_client):
        response = api_client.get("/api/hotels/not-found-hotel/")
        payload = get_payload(response)

        assert response.status_code == 404
        assert payload["success"] is False
        assert payload["data"] is None
        assert payload["error"]["status"] == 404


@pytest.mark.django_db
class TestNearbyHotelsAPIView:
    def test_returns_nearby_hotels_for_middle_hotel(self, api_client):
        place = PlaceFactory(slug="place-nearby-middle")

        hotel_1 = HotelFactory(place=place, slug="nearby-middle-hotel-1", order_index=1)
        hotel_2 = HotelFactory(place=place, slug="nearby-middle-hotel-2", order_index=2)
        hotel_3 = HotelFactory(place=place, slug="nearby-middle-hotel-3", order_index=3)
        hotel_4 = HotelFactory(place=place, slug="nearby-middle-hotel-4", order_index=4)
        hotel_5 = HotelFactory(place=place, slug="nearby-middle-hotel-5", order_index=5)

        response = api_client.get(f"/api/hotels/{hotel_3.slug}/nearby/")
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert [item["slug"] for item in payload["data"]] == [
            hotel_2.slug,
            hotel_4.slug,
            hotel_5.slug,
        ]

    def test_returns_nearby_hotels_for_first_hotel(self, api_client):
        place = PlaceFactory(slug="place-nearby-first")

        hotel_1 = HotelFactory(place=place, slug="nearby-first-hotel-1", order_index=1)
        hotel_2 = HotelFactory(place=place, slug="nearby-first-hotel-2", order_index=2)
        hotel_3 = HotelFactory(place=place, slug="nearby-first-hotel-3", order_index=3)
        hotel_4 = HotelFactory(place=place, slug="nearby-first-hotel-4", order_index=4)

        response = api_client.get(f"/api/hotels/{hotel_1.slug}/nearby/")
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert [item["slug"] for item in payload["data"]] == [
            hotel_2.slug,
            hotel_3.slug,
            hotel_4.slug,
        ]

    def test_returns_nearby_hotels_for_last_hotel(self, api_client):
        place = PlaceFactory(slug="place-nearby-last")

        hotel_1 = HotelFactory(place=place, slug="nearby-last-hotel-1", order_index=1)
        hotel_2 = HotelFactory(place=place, slug="nearby-last-hotel-2", order_index=2)
        hotel_3 = HotelFactory(place=place, slug="nearby-last-hotel-3", order_index=3)
        hotel_4 = HotelFactory(place=place, slug="nearby-last-hotel-4", order_index=4)

        response = api_client.get(f"/api/hotels/{hotel_4.slug}/nearby/")
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert [item["slug"] for item in payload["data"]] == [
            hotel_1.slug,
            hotel_2.slug,
            hotel_3.slug,
        ]

    def test_returns_nearby_hotels_for_hotel_with_one_next_hotel(self, api_client):
        place = PlaceFactory(slug="place-nearby-one-next")

        hotel_1 = HotelFactory(
            place=place, slug="nearby-one-next-hotel-1", order_index=1
        )
        hotel_2 = HotelFactory(
            place=place, slug="nearby-one-next-hotel-2", order_index=2
        )
        hotel_3 = HotelFactory(
            place=place, slug="nearby-one-next-hotel-3", order_index=3
        )
        hotel_4 = HotelFactory(
            place=place, slug="nearby-one-next-hotel-4", order_index=4
        )

        response = api_client.get(f"/api/hotels/{hotel_3.slug}/nearby/")
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert [item["slug"] for item in payload["data"]] == [
            hotel_1.slug,
            hotel_2.slug,
            hotel_4.slug,
        ]


@pytest.mark.django_db
class TestHotelsByPlaceTreeAPIView:
    def test_filters_hotels_by_labels_with_or_mode(self, api_client):
        place = PlaceFactory(slug="place-or-mode")

        hotel_1 = HotelFactory(
            place=place,
            slug="or-hotel-1",
            order_index=1,
            labels=["label-1"],
        )
        hotel_2 = HotelFactory(
            place=place,
            slug="or-hotel-2",
            order_index=2,
            labels=["label-2"],
        )
        hotel_3 = HotelFactory(
            place=place,
            slug="or-hotel-3",
            order_index=3,
            labels=["label-1", "label-2"],
        )
        hotel_4 = HotelFactory(
            place=place,
            slug="or-hotel-4",
            order_index=4,
            labels=["label-4"],
        )

        response = api_client.get(
            f"/api/places/{place.slug}/hotels/?labels=label-1,label-2&mode=or"
        )
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert [item["slug"] for item in payload["data"]["results"]] == [
            hotel_1.slug,
            hotel_2.slug,
            hotel_3.slug,
        ]

    def test_filters_hotels_by_labels_with_and_mode(self, api_client):
        place = PlaceFactory(slug="place-and-mode")

        hotel_1 = HotelFactory(
            place=place,
            slug="and-hotel-1",
            order_index=1,
            labels=["label-1"],
        )
        hotel_2 = HotelFactory(
            place=place,
            slug="and-hotel-2",
            order_index=2,
            labels=["label-2"],
        )
        hotel_3 = HotelFactory(
            place=place,
            slug="and-hotel-3",
            order_index=3,
            labels=["label-1", "label-2"],
        )
        response = api_client.get(
            f"/api/places/{place.slug}/hotels/?labels=label-1,label-2&mode=and"
        )
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert [item["slug"] for item in payload["data"]["results"]] == [
            hotel_3.slug,
        ]

    def test_returns_first_page_of_paginated_results(self, api_client):
        place = PlaceFactory(slug="place-pagination-page-1")

        hotels = [
            HotelFactory(
                place=place,
                slug=f"pagination-page-1-hotel-{i}",
                order_index=i,
            )
            for i in range(1, 31)
        ]

        response = api_client.get(f"/api/places/{place.slug}/hotels/")
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert payload["data"]["count"] == 30
        assert payload["data"]["previous"] is None
        assert payload["data"]["next"] is not None
        assert len(payload["data"]["results"]) == 24
        assert [item["slug"] for item in payload["data"]["results"]] == [
            hotel.slug for hotel in hotels[:24]
        ]

    def test_returns_second_page_of_paginated_results(self, api_client):
        place = PlaceFactory(slug="place-pagination-page-2")

        hotels = [
            HotelFactory(
                place=place,
                slug=f"pagination-page-2-hotel-{i}",
                order_index=i,
            )
            for i in range(1, 31)
        ]

        response = api_client.get(f"/api/places/{place.slug}/hotels/?page=2")
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert payload["data"]["count"] == 30
        assert payload["data"]["next"] is None
        assert payload["data"]["previous"] is not None
        assert len(payload["data"]["results"]) == 6
        assert [item["slug"] for item in payload["data"]["results"]] == [
            hotel.slug for hotel in hotels[24:]
        ]


@pytest.mark.django_db
class TestPlacePageLatestUpdatedAtAPIView:
    def test_returns_latest_updated_at_from_hotels(self, api_client):
        place = PlaceFactory(slug="place-updated-at-hotels")
        place_detail = PlaceDetailFactory(place=place)

        hotel_1 = HotelFactory(
            place=place,
            slug="place-updated-at-hotels-1",
            is_active=True,
        )
        hotel_2 = HotelFactory(
            place=place,
            slug="place-updated-at-hotels-2",
            is_active=True,
        )

        place_detail_time = timezone.now() - timedelta(days=2)
        hotel_1_time = timezone.now() - timedelta(days=1)
        hotel_2_time = timezone.now()

        PlaceDetail.objects.filter(pk=place_detail.pk).update(
            updated_at=place_detail_time
        )
        Hotel.objects.filter(pk=hotel_1.pk).update(updated_at=hotel_1_time)
        Hotel.objects.filter(pk=hotel_2.pk).update(updated_at=hotel_2_time)

        response = api_client.get(f"/api/updates/places/{place.slug}/")
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert payload["data"]["updated_at"] == hotel_2_time.isoformat().replace(
            "+00:00", "Z"
        )

    def test_returns_latest_updated_at_from_place_detail(self, api_client):
        place = PlaceFactory(slug="place-updated-at-detail")
        place_detail = PlaceDetailFactory(place=place)

        hotel_1 = HotelFactory(
            place=place,
            slug="place-updated-at-detail-1",
            is_active=True,
        )
        hotel_2 = HotelFactory(
            place=place,
            slug="place-updated-at-detail-2",
            is_active=True,
        )

        hotel_1_time = timezone.now() - timedelta(days=2)
        hotel_2_time = timezone.now() - timedelta(days=1)
        place_detail_time = timezone.now()

        Hotel.objects.filter(pk=hotel_1.pk).update(updated_at=hotel_1_time)
        Hotel.objects.filter(pk=hotel_2.pk).update(updated_at=hotel_2_time)
        PlaceDetail.objects.filter(pk=place_detail.pk).update(
            updated_at=place_detail_time
        )

        response = api_client.get(f"/api/updates/places/{place.slug}/")
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert payload["data"]["updated_at"] == place_detail_time.isoformat().replace(
            "+00:00", "Z"
        )


@pytest.mark.django_db
class TestLabelPageLatestUpdatedAtAPIView:
    def test_returns_latest_updated_at_from_hotels(self, api_client):
        label = LabelFactory(slug="label-updated-at-hotels")

        hotel_1 = HotelFactory(
            slug="label-updated-at-hotels-1",
            labels=[label.slug],
            is_active=True,
        )
        hotel_2 = HotelFactory(
            slug="label-updated-at-hotels-2",
            labels=[label.slug],
            is_active=True,
        )

        label_time = timezone.now() - timedelta(days=2)
        hotel_1_time = timezone.now() - timedelta(days=1)
        hotel_2_time = timezone.now()

        Label.objects.filter(pk=label.pk).update(updated_at=label_time)
        Hotel.objects.filter(pk=hotel_1.pk).update(updated_at=hotel_1_time)
        Hotel.objects.filter(pk=hotel_2.pk).update(updated_at=hotel_2_time)

        response = api_client.get(f"/api/updates/labels/{label.slug}/")
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert payload["data"]["updated_at"] == hotel_2_time.isoformat().replace(
            "+00:00", "Z"
        )

    def test_returns_latest_updated_at_from_label(self, api_client):
        label = LabelFactory(slug="label-updated-at-self")

        hotel_1 = HotelFactory(
            slug="label-updated-at-self-1",
            labels=[label.slug],
            is_active=True,
        )
        hotel_2 = HotelFactory(
            slug="label-updated-at-self-2",
            labels=[label.slug],
            is_active=True,
        )

        hotel_1_time = timezone.now() - timedelta(days=2)
        hotel_2_time = timezone.now() - timedelta(days=1)
        label_time = timezone.now()

        Hotel.objects.filter(pk=hotel_1.pk).update(updated_at=hotel_1_time)
        Hotel.objects.filter(pk=hotel_2.pk).update(updated_at=hotel_2_time)
        Label.objects.filter(pk=label.pk).update(updated_at=label_time)

        response = api_client.get(f"/api/updates/labels/{label.slug}/")
        payload = get_payload(response)

        assert response.status_code == 200
        assert payload["success"] is True
        assert payload["data"]["updated_at"] == label_time.isoformat().replace(
            "+00:00", "Z"
        )


@pytest.mark.django_db
class TestGetHotelsByPlaceTree:
    def test_returns_hotels_from_place_and_child_places(self):
        parent_place = PlaceFactory(slug="parent-place")
        child_place = PlaceFactory(slug="child-place", parent_slug="parent-place")
        other_place = PlaceFactory(slug="other-place")

        parent_hotel = HotelFactory(
            place=parent_place, slug="parent-hotel", is_active=True
        )
        child_hotel = HotelFactory(
            place=child_place, slug="child-hotel", is_active=True
        )
        other_hotel = HotelFactory(
            place=other_place, slug="other-hotel", is_active=True
        )

        hotels = get_hotels_by_place_tree("parent-place")

        assert list(hotels.order_by("slug")) == [child_hotel, parent_hotel]
        assert other_hotel not in hotels
