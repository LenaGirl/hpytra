# places/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Place
from .serializers import PlaceListLiteSerializer, PlaceListWithMapSerializer, PlaceLastUpdatedAtSerializer

class PlaceListLiteAPIView(APIView):
    def get(self, request):
        places = (
                Place.objects
                .filter(is_active=True)
                .only('name', 'slug', 'parent_slug', 'order_index')
                .order_by('order_index')
        )

        serializer = PlaceListLiteSerializer(places, many=True)
        return Response(serializer.data)
    
class PlaceListWithMapAPIView(APIView):
    def get(self, request):
        places = (
            Place.objects
            .filter(is_active=True)
            .only(
                'name',
                'slug',
                'parent_slug',
                'order_index',
                'map_center_lat',
                'map_center_lng',
                'map_zoom',
            )
            .order_by('order_index')
        )
        serializer = PlaceListWithMapSerializer(places, many=True)
        return Response(serializer.data)

class PlaceLastUpdatedAtAPIView(APIView):
    def get(self, request):
        place = (
            Place.objects
            .filter(is_active=True)
            .order_by('-updated_at')
            .only('updated_at')
            .first()
        )
        serializer = PlaceLastUpdatedAtSerializer(place)
        return Response(serializer.data)
