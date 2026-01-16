from rest_framework import serializers
from .models import Place

class PlaceListLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = ['name', 'slug', 'parent_slug', 'order_index']

class PlaceListWithMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = [
            'name',
            'slug',
            'parent_slug',
            'order_index',
            'map_center_lat',
            'map_center_lng',
            'map_zoom',
        ]

class PlaceLastUpdatedAtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = ['updated_at']
