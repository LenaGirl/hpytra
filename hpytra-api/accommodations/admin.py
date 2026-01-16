from django.contrib import admin
from .models import Place, PlaceDetail, Hotel, Label


@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent_slug", "order_index", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "slug", "parent_slug")
    ordering = ("order_index", "name")
    readonly_fields = ("id", "created_at", "updated_at")


@admin.register(PlaceDetail)
class PlaceDetailAdmin(admin.ModelAdmin):
    list_display = ("place", "title")
    list_filter = ("is_active",)
    search_fields = ("place", "title")
    ordering = ("place", "title")
    readonly_fields = ("id", "created_at", "updated_at")


@admin.register(Label)
class LabelAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "category", "order_index", "featured")
    list_filter = ("category", "featured", "featured_prefix", "is_active")
    search_fields = ("name", "slug")
    ordering = ("order_index", "name")
    readonly_fields = ("id", "created_at", "updated_at")


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "slug",
        "place",
        "order_index",
    )
    list_filter = ("show_on_homepage", "is_active")
    search_fields = ("name", "slug", "place")
    ordering = ("place", "order_index")
    readonly_fields = ("id", "created_at", "updated_at")