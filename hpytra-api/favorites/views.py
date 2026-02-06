from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Favorite
from accommodations.models import Hotel
from accommodations.serializers import HotelItemSerializer


class FavoriteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        favorites = user.favorites.select_related("hotel").order_by("-created_at")

        hotels = [fav.hotel for fav in favorites]

        serializer = HotelItemSerializer(hotels, many=True)
        return Response(serializer.data)


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

        if not isinstance(hotel_slugs, list) or not hotel_slugs:
            return Response([])

        favorited_slugs = Favorite.objects.filter(
            user=user, hotel__slug__in=hotel_slugs
        ).values_list("hotel__slug", flat=True)

        return Response(list(favorited_slugs))
