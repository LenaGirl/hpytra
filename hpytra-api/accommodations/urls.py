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
    # places
    path("places/", PlacesLiteAPIView.as_view()),
    path("places/map/", PlacesMapAPIView.as_view()),
    path("places/<slug:slug>/", PlaceDetailAPIView.as_view()),
    path("places/<slug:place_slug>/labels/", LabelsByPlaceTreeAPIView.as_view()),
    path("places/<slug:place_slug>/hotels/", HotelsByPlaceTreeAPIView.as_view()),
    path(
        "places/<slug:place_slug>/hotels/map/",
        HotelsByPlaceTreeMapAPIView.as_view(),
    ),
    # labels
    path("labels/", LabelsLiteAPIView.as_view()),
    path("labels/<slug:slug>/", LabelDetailAPIView.as_view()),
    path("labels/<slug:label_slug>/hotels/", HotelsByLabelAPIView.as_view()),
    # hotels
    path("hotels/top/", TopHotelsAPIView.as_view()),
    path("hotels/<slug:slug>/", HotelDetailAPIView.as_view()),
    path("hotels/<slug:slug>/nearby/", NearbyHotelsAPIView.as_view()),
    # updates
    path("updates/hotels/", HotelsLatestUpdatedAtAPIView.as_view()),
    path("updates/places/<slug:slug>/", PlacePageLatestUpdatedAtAPIView.as_view()),
    path("updates/labels/<slug:slug>/", LabelPageLatestUpdatedAtAPIView.as_view()),
]
