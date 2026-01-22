from django.urls import path
from .views import (
    PlacesLiteAPIView,
    PlaceDetailAPIView,
    PlacesMapAPIView,
    PlacePageLatestUpdatedAtAPIView,
    LabelsLiteAPIView,
    LabelDetailAPIView,
    LabelsByPlaceTreeAPIView,
    LabelPageLatestUpdatedAtAPIView,
    TopHotelsAPIView,
    HotelsByLabelAPIView,
    HotelDetailAPIView,
    NearbyHotelsAPIView,
    HotelsByPlaceTreeAPIView,
    HotelsByPlaceTreeMapAPIView,
    HotelsLatestUpdatedAtAPIView,
)

urlpatterns = [
    path("places/", PlacesLiteAPIView.as_view()),
    path("places/map/", PlacesMapAPIView.as_view()),
    path("places/<slug:slug>/", PlaceDetailAPIView.as_view()),
    path(
        "places/<slug:slug>/latest-updated-at/",
        PlacePageLatestUpdatedAtAPIView.as_view(),
    ),
    path("labels/", LabelsLiteAPIView.as_view()),
    path("labels/by-place-tree/<slug:place_slug>/", LabelsByPlaceTreeAPIView.as_view()),
    path("labels/<slug:slug>/", LabelDetailAPIView.as_view()),
    path(
        "labels/<slug:slug>/latest-updated-at/",
        LabelPageLatestUpdatedAtAPIView.as_view(),
    ),
    path("hotels/top/", TopHotelsAPIView.as_view()),
    path("hotels/by-place-tree/<slug:place_slug>/", HotelsByPlaceTreeAPIView.as_view()),
    path(
        "hotels/by-place-tree/<slug:place_slug>/map/",
        HotelsByPlaceTreeMapAPIView.as_view(),
    ),
    path("hotels/latest-updated-at/", HotelsLatestUpdatedAtAPIView.as_view()),
    path("hotels/labels/<slug:label_slug>/", HotelsByLabelAPIView.as_view()),
    path("hotels/<slug:slug>/", HotelDetailAPIView.as_view()),
    path("hotels/<slug:slug>/nearby/", NearbyHotelsAPIView.as_view()),
]
