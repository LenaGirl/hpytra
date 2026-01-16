from django.urls import path
from .views import PlaceListLiteAPIView, PlaceListWithMapAPIView, PlaceLastUpdatedAtAPIView

urlpatterns = [
    path('places/', PlaceListLiteAPIView.as_view()),
    path('places/map/', PlaceListWithMapAPIView.as_view()),
    path('places/last-updated-at/', PlaceLastUpdatedAtAPIView.as_view()),
]
