from django.contrib import admin
from .models import Favorite


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("user", "hotel", "created_at")
    ordering = ("-created_at",)
    readonly_fields = ("user", "hotel", "created_at")
