from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Max, Func, Q
from django.db.models.functions import Random
from django.http import HttpResponsePermanentRedirect
from django.conf import settings
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from .models import Place, PlaceDetail, Label, Hotel
from core.pagination import HotelPagination
from .serializers import (
    PlacesLiteSerializer,
    PlaceDetailSerializer,
    PlacesMapSerializer,
    LabelsLiteSerializer,
    LabelDetailSerializer,
    LabelsByPlaceSerializer,
    HotelDetailSerializer,
    HotelItemSerializer,
    HotelPlaceHighlightSerializer,
    HotelsMapSerializer,
    HotelsLatestUpdatedAtSerializer,
    LatestUpdatedAtSerializer,
)


@method_decorator(cache_page(settings.CACHE["LONG"]), name="dispatch")
class PlacesLiteAPIView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = PlacesLiteSerializer

    def get_queryset(self):
        return (
            Place.objects.filter(is_active=True)
            .only("name", "slug", "parent_slug", "order_index")
            .order_by("order_index")
        )


@method_decorator(cache_page(settings.CACHE["LONG"]), name="dispatch")
class PlaceDetailAPIView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = PlaceDetailSerializer
    lookup_field = "place"
    lookup_url_kwarg = "slug"

    def get_queryset(self):
        return PlaceDetail.objects.filter(is_active=True)


@method_decorator(cache_page(settings.CACHE["LONG"]), name="dispatch")
class PlacesMapAPIView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = PlacesMapSerializer

    def get_queryset(self):
        return (
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


@method_decorator(cache_page(settings.CACHE["LONG"]), name="dispatch")
class PlacePageLatestUpdatedAtAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

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


@method_decorator(cache_page(settings.CACHE["LONG"]), name="dispatch")
class LabelsLiteAPIView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = LabelsLiteSerializer

    def get_queryset(self):
        return (
            Label.objects.filter(is_active=True)
            .only("name", "slug", "category", "order_index")
            .order_by("order_index")
        )


@method_decorator(cache_page(settings.CACHE["LONG"]), name="dispatch")
class LabelDetailAPIView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = LabelDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return Label.objects.filter(is_active=True)


@method_decorator(cache_page(settings.CACHE["NORMAL"]), name="dispatch")
class LabelsByPlaceTreeAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, place_slug):
        # 取得 place tree 下的 hotels
        hotels = get_hotels_by_place_tree(place_slug)

        # 從 hotels 收集所有 label slugs: 展平 -> 取欄位資料 -> 去重
        label_slugs = list(
            hotels.annotate(label_slug=Func("labels", function="unnest"))
            .values_list("label_slug", flat=True)
            .distinct()
        )

        if not label_slugs:
            return Response([])

        # 取得符合的 Labels 物件
        labels = Label.objects.filter(
            slug__in=label_slugs,
            is_active=True,
        ).order_by("order_index")

        serializer = LabelsByPlaceSerializer(labels, many=True)
        return Response(serializer.data)


@method_decorator(cache_page(settings.CACHE["LONG"]), name="dispatch")
class LabelPageLatestUpdatedAtAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, slug):
        # page 中 hotels 的最大更新時間
        hotels_latest_updated_at = (
            Hotel.objects.filter(labels__contains=[slug], is_active=True)
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


@method_decorator(cache_page(settings.CACHE["NORMAL"]), name="dispatch")
class HotelDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        # URL slug 含有大寫字母 -> 使用 HTTT(301) 永久重定向到全小寫 URL
        if slug != slug.lower():
            return HttpResponsePermanentRedirect(request.path.lower())

        hotel = get_object_or_404(
            Hotel,
            slug=slug,
            is_active=True,
        )

        serializer = HotelDetailSerializer(hotel)
        return Response(serializer.data)


@method_decorator(cache_page(settings.CACHE["NORMAL"]), name="dispatch")
class NearbyHotelsAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        current_hotel = get_object_or_404(Hotel, slug=slug.lower())

        # 與此 hotel 相同 place 的所有 hotels
        base_qs = Hotel.objects.filter(
            place=current_hotel.place,
            is_active=True,
        )

        # 取前 3 個 hotels
        prev_hotels = list(
            base_qs.filter(order_index__lt=current_hotel.order_index).order_by(
                "-order_index"
            )[:3]
        )

        # 取後 3 個 hotels
        next_hotels = list(
            base_qs.filter(order_index__gt=current_hotel.order_index).order_by(
                "order_index"
            )[:3]
        )

        prev_hotels.reverse()

        # 取得 [ 前 1 個 + 後 2 個 ] hotels ，或其他邊界情況
        if not prev_hotels:  # 第一個
            nearby = next_hotels[:3]

        elif not next_hotels:  # 最後一個
            nearby = prev_hotels[-3:]

        elif len(next_hotels) == 1:  # 倒數第二
            nearby = prev_hotels[-2:] + next_hotels[:1]

        else:  # 正常情況
            nearby = prev_hotels[-1:] + next_hotels[:2]

        serializer = HotelItemSerializer(nearby, many=True)
        return Response(serializer.data)


@method_decorator(cache_page(settings.CACHE["SHORT"]), name="dispatch")
class TopHotelsAPIView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = HotelItemSerializer

    # 取得所有標記為 show_on_homepage 的 hotels，隨機選 12 筆
    def get_queryset(self):
        return Hotel.objects.filter(
            show_on_homepage=True,
            is_active=True,
        ).order_by(
            Random()
        )[:12]


@method_decorator(cache_page(settings.CACHE["NORMAL"]), name="dispatch")
class HotelsByLabelAPIView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = HotelItemSerializer
    pagination_class = HotelPagination  # 分頁

    def get_queryset(self):
        label_slug = self.kwargs["label_slug"]

        return Hotel.objects.filter(
            labels__contains=[label_slug],
            is_active=True,
        ).order_by("order_index")


@method_decorator(cache_page(settings.CACHE["NORMAL"]), name="dispatch")
class HotelsByPlaceTreeAPIView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = HotelItemSerializer
    pagination_class = HotelPagination  # 分頁

    # 取得 place (含子層級) 的 hotels，並依照篩選條件的 label_slugs 進行 AND 或 OR 過濾
    def get_queryset(self):

        place_slug = self.kwargs["place_slug"]

        label_slugs = self.request.GET.get("labels")
        mode = self.request.GET.get("mode", "or")

        hotels = get_hotels_by_place_tree(place_slug).order_by("order_index")

        if label_slugs:
            filtered_labels = label_slugs.split(",")

            if mode == "and":
                hotels = hotels.filter(labels__contains=filtered_labels)
            else:
                hotels = hotels.filter(labels__overlap=filtered_labels)

        return hotels


@method_decorator(cache_page(settings.CACHE["NORMAL"]), name="dispatch")
class HotelPlaceHighlightsAPIView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = HotelPlaceHighlightSerializer

    # 取得 place (含子層級) 的 hotels
    def get_queryset(self):
        place_slug = self.kwargs["place_slug"]
        return get_hotels_by_place_tree(place_slug).order_by("order_index")


@method_decorator(cache_page(settings.CACHE["NORMAL"]), name="dispatch")
class HotelsByPlaceTreeMapAPIView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = HotelsMapSerializer

    # 取得 place (含子層級) 的 hotels
    def get_queryset(self):
        place_slug = self.kwargs["place_slug"]

        return get_hotels_by_place_tree(place_slug).only(
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


@method_decorator(cache_page(settings.CACHE["LONG"]), name="dispatch")
class HotelsLatestUpdatedAtAPIView(ListAPIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = HotelsLatestUpdatedAtSerializer

    def get_queryset(self):
        return (
            Hotel.objects.filter(is_active=True)
            .only("slug", "updated_at")
            .order_by("slug")
        )


def get_hotels_by_place_tree(place_slug):

    # 自己 place + 子層 places 的 hotels
    return Hotel.objects.filter(
        is_active=True,
        place__in=Place.objects.filter(Q(slug=place_slug) | Q(parent_slug=place_slug)),
    )
