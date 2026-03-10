from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Favorite
from accommodations.models import Hotel
from accommodations.serializers import HotelItemSerializer
from core.pagination import HotelPagination


class FavoriteAPIView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = HotelItemSerializer
    pagination_class = HotelPagination  # 分頁

    def get_queryset(self):
        user = self.request.user

        return Hotel.objects.filter(favorites__user=user).order_by(
            "-favorites__created_at"
        )


class FavoriteToggleAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, hotel_slug):
        user = request.user
        hotel = Hotel.objects.get(slug=hotel_slug)

        Favorite.objects.get_or_create(
            user=user,
            hotel=hotel,
        )

        return Response(status=status.HTTP_204_NO_CONTENT)

    def delete(self, request, hotel_slug):
        user = request.user
        hotel = Hotel.objects.get(slug=hotel_slug)

        Favorite.objects.filter(
            user=user,
            hotel=hotel,
        ).delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class FavoriteStatusByHotelsAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user = request.user

        if not user.is_authenticated:
            return Response([])

        hotel_slugs = request.data.get("hotel_slugs", [])

        # 限制 hotel_slugs 的長度，避免過多的資料庫查詢
        if len(hotel_slugs) > 100:
            return Response([], status=400)

        if not isinstance(hotel_slugs, list) or not hotel_slugs:
            return Response([])

        favorited_slugs = Favorite.objects.filter(
            user=user, hotel__slug__in=hotel_slugs
        ).values_list("hotel__slug", flat=True)

        return Response(list(favorited_slugs))
