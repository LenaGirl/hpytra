from rest_framework import serializers
from .models import Place, PlaceDetail, Label, Hotel

# =========================
# Mixins
# =========================


class HotelPhotosMixin:
    def get_photos(self, obj):
        return [
            obj.photo_1,
            obj.photo_2,
            obj.photo_3,
            obj.photo_4,
            obj.photo_5,
            obj.photo_6,
            obj.photo_7,
            obj.photo_8,
            obj.photo_9,
            obj.photo_10,
        ]


# =========================
# Serializers
# =========================


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


class HotelDetailSerializer(HotelPhotosMixin, serializers.ModelSerializer):
    photos = serializers.SerializerMethodField()
    reals = serializers.SerializerMethodField()

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

    def get_reals(self, obj):
        return [
            obj.real_1,
            obj.real_2,
            obj.real_3,
            obj.real_4,
            obj.real_5,
            obj.real_6,
        ]


class HotelItemSerializer(HotelPhotosMixin, serializers.ModelSerializer):
    photos = serializers.SerializerMethodField()

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
            "updated_at",
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
