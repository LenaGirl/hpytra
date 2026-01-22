from django.db import models
import json
from django.contrib.postgres.fields import ArrayField


class Place(models.Model):
    id = models.UUIDField(primary_key=True)
    name = models.CharField(max_length=30)
    slug = models.SlugField(unique=True)
    parent_slug = models.SlugField(blank=True, null=True)
    order_index = models.IntegerField(default=0)

    map_center_lat = models.DecimalField(
        max_digits=9, decimal_places=6, blank=True, null=True
    )
    map_center_lng = models.DecimalField(
        max_digits=9, decimal_places=6, blank=True, null=True
    )
    map_zoom = models.DecimalField(
        max_digits=4, decimal_places=2, blank=True, null=True
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True)

    class Meta:
        db_table = "places"
        managed = False

    def __str__(self):
        return self.name


class SafeJSONField(models.JSONField):
    """
    自定義 JSON 欄位：若資料已解析為 Python 物件(list/dict)則直接回傳，
    避免 Django 執行重複解析導致的 TypeError。
    """

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value

        if isinstance(value, (dict, list)):
            return value
        try:
            return json.loads(value)
        except (ValueError, TypeError):
            return value


class PlaceDetail(models.Model):
    id = models.UUIDField(primary_key=True)

    place = models.OneToOneField(
        "Place",
        on_delete=models.DO_NOTHING,
        db_column="slug",  # 指定資料庫中 PlaceDetail 的 slug 欄位
        to_field="slug",  # 關聯到 Place Model 的 slug 欄位
        related_name="detail",  # 可用 place.detail 反向查詢
    )

    title = models.CharField(max_length=100, blank=True, null=True)
    content = SafeJSONField(blank=True, null=True)

    seo_description = models.CharField(max_length=200, blank=True, null=True)
    seo_keywords = ArrayField(models.CharField(max_length=20), blank=True, null=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True)

    class Meta:
        db_table = "place_details"
        managed = False

    def __str__(self):
        return self.place.slug


class Label(models.Model):
    id = models.UUIDField(primary_key=True)
    name = models.CharField(max_length=30)
    slug = models.SlugField(unique=True)

    category = models.SlugField(blank=True, null=True)
    order_index = models.IntegerField(default=0)

    featured = models.BooleanField(default=False)
    featured_prefix = models.BooleanField(default=False)
    featured_suffix = models.CharField(max_length=10, blank=True, null=True)
    description = models.CharField(max_length=200, blank=True, null=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True)

    class Meta:
        db_table = "labels"
        managed = False

    def __str__(self):
        return self.name


class Hotel(models.Model):
    id = models.UUIDField(primary_key=True)
    name = models.CharField(max_length=60)
    slug = models.SlugField(unique=True)

    place = models.ForeignKey(
        "Place",
        on_delete=models.DO_NOTHING,
        db_column="place_slug",  # 指定資料庫中 Hotel 的 place_slug 欄位
        to_field="slug",  # 關聯到 Place Model 的 slug 欄位
        related_name="hotels",  # 可用 place.hotels 反向查詢
    )

    order_index = models.IntegerField(default=0)

    address = models.CharField(max_length=200, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    labels = ArrayField(models.SlugField(), blank=True, default=list)

    coordinates_lat = models.DecimalField(
        max_digits=9, decimal_places=6, blank=True, null=True
    )
    coordinates_lng = models.DecimalField(
        max_digits=9, decimal_places=6, blank=True, null=True
    )

    google_rating = models.DecimalField(
        max_digits=2, decimal_places=1, blank=True, null=True
    )
    google_reviews_count = models.IntegerField(blank=True, null=True)

    price_double_room = models.IntegerField(blank=True, null=True)
    price_quad_room = models.IntegerField(blank=True, null=True)

    show_on_homepage = models.BooleanField(default=False)

    agoda_slug = models.CharField(max_length=30, blank=True, null=True)
    booking_slug = models.CharField(max_length=100, blank=True, null=True)
    klook_slug = models.CharField(max_length=100, blank=True, null=True)
    kkday_slug = models.CharField(max_length=100, blank=True, null=True)

    photo_main = models.URLField(blank=True, null=True)
    photo_1 = models.URLField(blank=True, null=True)
    photo_2 = models.URLField(blank=True, null=True)
    photo_3 = models.URLField(blank=True, null=True)
    photo_4 = models.URLField(blank=True, null=True)
    photo_5 = models.URLField(blank=True, null=True)
    photo_6 = models.URLField(blank=True, null=True)
    photo_7 = models.URLField(blank=True, null=True)
    photo_8 = models.URLField(blank=True, null=True)
    photo_9 = models.URLField(blank=True, null=True)
    photo_10 = models.URLField(blank=True, null=True)

    real_1 = models.URLField(max_length=500, blank=True, null=True)
    real_2 = models.URLField(max_length=500, blank=True, null=True)
    real_3 = models.URLField(max_length=500, blank=True, null=True)
    real_4 = models.URLField(max_length=500, blank=True, null=True)
    real_5 = models.URLField(max_length=500, blank=True, null=True)
    real_6 = models.URLField(max_length=500, blank=True, null=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True)

    class Meta:
        db_table = "hotels"
        managed = False

    def __str__(self):
        return self.name
