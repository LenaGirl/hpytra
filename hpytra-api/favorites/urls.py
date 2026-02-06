from django.urls import path
from .views import (
    FavoriteAPIView,
    FavoriteToggleAPIView,
    FavoriteStatusByHotelsAPIView,
)

urlpatterns = [
    path("", FavoriteAPIView.as_view()),
    path(
        "toggle/<slug:hotel_slug>/",
        FavoriteToggleAPIView.as_view(),
    ),
    path(
        "status/by-hotels/",
        FavoriteStatusByHotelsAPIView.as_view(),
    ),
]
