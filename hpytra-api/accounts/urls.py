from django.urls import path
from .views import (
    MeView,
    RegisterView,
    LoginView,
    LogoutView,
    RefreshView,
    ChangePasswordView,
)

urlpatterns = [
    path("me/", MeView.as_view()),
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("refresh/", RefreshView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),
]
