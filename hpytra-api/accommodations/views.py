import random
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Max
from .models import Place, PlaceDetail, Label, Hotel
from .serializers import (
    PlacesLiteSerializer,
    PlaceDetailSerializer,
    PlacesMapSerializer,
    LabelsLiteSerializer,
    LabelDetailSerializer,
    LabelsByPlaceSerializer,
    HotelDetailSerializer,
    HotelItemSerializer,
    HotelsMapSerializer,
    HotelsLatestUpdatedAtSerializer,
    LatestUpdatedAtSerializer,
)


class PlacesLiteAPIView(APIView):
    def get(self, request):
        places = (
            Place.objects.filter(is_active=True)
            .only("name", "slug", "parent_slug", "order_index")
            .order_by("order_index")
        )

        serializer = PlacesLiteSerializer(places, many=True)
        return Response(serializer.data)


class PlaceDetailAPIView(APIView):
    def get(self, request, slug):
        place = get_object_or_404(
            PlaceDetail,
            place=slug,
            is_active=True,
        )
        serializer = PlaceDetailSerializer(place)
        return Response(serializer.data)


class PlacesMapAPIView(APIView):
    def get(self, request):
        places = (
            Place.objects.filter(is_active=True)
            .only(
                "name",
                "slug",
                "parent_slug",
                "order_index",
                "map_center_lat",
                "map_center_lng",
                "map_zoom",
            )
            .order_by("order_index")
        )
        serializer = PlacesMapSerializer(places, many=True)
        return Response(serializer.data)


class PlacePageLatestUpdatedAtAPIView(APIView):
    def get(self, request, slug):
        # page 中 hotels 的最大更新時間
        hotels_latest_updated_at = (
            get_hotels_by_place_tree(slug)
            .aggregate(max_updated_at=Max("updated_at"))
            .get("max_updated_at")
        )

        # place detail 更新時間
        place_detail_updated_at = PlaceDetail.objects.get(place__slug=slug).updated_at

        # page 最終更新時間
        latest_updated_at = max(
            filter(None, [hotels_latest_updated_at, place_detail_updated_at]),
            default=None,
        )

        serializer = LatestUpdatedAtSerializer({"updated_at": latest_updated_at})
        return Response(serializer.data)


class LabelsLiteAPIView(APIView):
    def get(self, request):
        labels = (
            Label.objects.filter(is_active=True)
            .only("name", "slug", "category", "order_index")
            .order_by("order_index")
        )
        serializer = LabelsLiteSerializer(labels, many=True)
        return Response(serializer.data)


class LabelDetailAPIView(APIView):
    def get(self, request, slug):
        label = get_object_or_404(
            Label,
            slug=slug,
            is_active=True,
        )
        serializer = LabelDetailSerializer(label)
        return Response(serializer.data)


class LabelsByPlaceTreeAPIView(APIView):
    def get(self, request, place_slug):
        # 取得 place tree 下的 hotels
        hotels = get_hotels_by_place_tree(place_slug)

        # 從 hotels 收集所有 label slugs
        label_slugs = set()
        for hotel in hotels:
            label_slugs.update(hotel.labels or [])

        if not label_slugs:
            return Response([])

        # 取得符合的 Labels 物件
        labels = Label.objects.filter(
            slug__in=label_slugs,
            is_active=True,
        ).order_by("order_index")

        serializer = LabelsByPlaceSerializer(labels, many=True)
        return Response(serializer.data)


class LabelPageLatestUpdatedAtAPIView(APIView):
    def get(self, request, slug):
        # page 中 hotels 的最大更新時間
        hotels_latest_updated_at = (
            Hotel.objects.filter(labels__icontains=slug)
            .aggregate(max_updated_at=Max("updated_at"))
            .get("max_updated_at")
        )

        # label 更新時間
        label_updated_at = Label.objects.get(slug=slug).updated_at

        # page 最終更新時間
        latest_updated_at = max(
            filter(None, [hotels_latest_updated_at, label_updated_at]),
            default=None,
        )

        serializer = LatestUpdatedAtSerializer({"updated_at": latest_updated_at})
        return Response(serializer.data)


class HotelsByLabelAPIView(APIView):
    def get(self, request, label_slug):
        hotels = Hotel.objects.filter(labels__icontains=label_slug).order_by(
            "order_index"
        )
        serializer = HotelItemSerializer(hotels, many=True)
        return Response(serializer.data)


class HotelDetailAPIView(APIView):
    def get(self, request, slug):
        hotel = get_object_or_404(
            Hotel,
            slug=slug,
            is_active=True,
        )
        serializer = HotelDetailSerializer(hotel)
        return Response(serializer.data)


class NearbyHotelsAPIView(APIView):
    def get(self, request, slug):
        current_hotel = get_object_or_404(Hotel, slug=slug)

        # 取得同一 place 的所有 hotels，並依 order_index 排序
        hotels = list(current_hotel.place.hotels.all().order_by("order_index"))

        total = len(hotels)

        # 找 current index
        idx = None
        for i in range(len(hotels)):
            if hotels[i].slug == current_hotel.slug:
                idx = i
                break

        nearby = []

        # 取得 [ 前面 1 個 + 後面 2 個 ] hotels ，或其他邊界情況
        if idx == 0:
            nearby = hotels[1:4]

        elif idx == total - 1:
            nearby = hotels[max(0, idx - 3) : idx]

        elif idx == total - 2:
            nearby = hotels[max(0, idx - 2) : idx] + hotels[idx + 1 : idx + 2]

        else:
            nearby = hotels[idx - 1 : idx] + hotels[idx + 1 : idx + 3]

        serializer = HotelItemSerializer(nearby, many=True)
        return Response(serializer.data)


class TopHotelsAPIView(APIView):
    def get(self, request):
        # 取得所有標記為 show_on_homepage 的 hotels，隨機選 12 筆
        hotels = list(Hotel.objects.filter(show_on_homepage=True))
        random.shuffle(hotels)
        top_hotels = hotels[:12]

        serializer = HotelItemSerializer(top_hotels, many=True)
        return Response(serializer.data)


class HotelsByPlaceTreeAPIView(APIView):
    def get(self, request, place_slug):
        # 取得 place (含子層級) 的 hotels
        hotels = get_hotels_by_place_tree(place_slug).order_by("order_index")
        serializer = HotelItemSerializer(hotels, many=True)
        return Response(serializer.data)


class HotelsByPlaceTreeMapAPIView(APIView):
    def get(self, request, place_slug):
        # 取得 place (含子層級) 的 hotels
        hotels = get_hotels_by_place_tree(place_slug).only(
            "name",
            "slug",
            "coordinates_lat",
            "coordinates_lng",
            "google_rating",
            "place",
            "labels",
            "order_index",
            "price_double_room",
            "price_quad_room",
            "agoda_slug",
            "booking_slug",
            "klook_slug",
            "kkday_slug",
            "photo_main",
        )
        serializer = HotelsMapSerializer(hotels, many=True)
        return Response(serializer.data)


class HotelsLatestUpdatedAtAPIView(APIView):
    def get(self, request):
        hotels = (
            Hotel.objects.filter(is_active=True)
            .only("slug", "updated_at")
            .order_by("slug")
        )
        serializer = HotelsLatestUpdatedAtSerializer(hotels, many=True)
        return Response(serializer.data)


def get_hotels_by_place_tree(place_slug):
    current_place = Place.objects.get(slug=place_slug)

    # 根據 place 層級決定所包含的 places
    if current_place.parent_slug:
        # 子層級 place ： 只取自己
        places = [current_place]
    else:
        # 父(縣市)層級 place ： 自己 + 子層 places
        child_places = Place.objects.filter(parent_slug=current_place.slug)
        places = [current_place, *child_places]

    return Hotel.objects.filter(
        place__in=places,
        is_active=True,
    )
