from rest_framework import serializers
from .models import Place, PlaceDetail, Label, Hotel


class PlacesLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = ["name", "slug", "parent_slug", "order_index"]


class PlaceDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaceDetail
        fields = [
            "place",
            "title",
            "content",
            "seo_description",
            "seo_keywords",
            "updated_at",
        ]


class PlacesMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = [
            "name",
            "slug",
            "parent_slug",
            "order_index",
            "map_center_lat",
            "map_center_lng",
            "map_zoom",
        ]


class LabelsLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = ["name", "slug", "category", "order_index"]


class LabelDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = ["name", "slug", "description", "updated_at"]


class LabelsByPlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = [
            "name",
            "slug",
            "category",
            "order_index",
            "featured",
            "featured_prefix",
            "featured_suffix",
            "description",
        ]


class HotelDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = Hotel
        fields = [
            "name",
            "address",
            "phone",
            "website",
            "slug",
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
            "photos",
            "reals",
            "updated_at",
        ]


class HotelItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = Hotel
        fields = [
            "name",
            "slug",
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
            "photos",
            "real_1",
        ]


class HotelPlaceHighlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = [
            "name",
            "slug",
            "labels",
            "price_quad_room",
        ]


class HotelsMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = [
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
        ]


class HotelsLatestUpdatedAtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = ["slug", "updated_at"]


class LatestUpdatedAtSerializer(serializers.Serializer):
    updated_at = serializers.DateTimeField(allow_null=True)
