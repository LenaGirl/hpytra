from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.exceptions import AuthenticationFailed
from .serializers import RegisterSerializer, LoginSerializer, ChangePasswordSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.models import update_last_login
from utils.turnstile import require_turnstile

User = get_user_model()

COOKIE_KWARGS = {
    "httponly": True,
    "secure": True,
    "samesite": "None",
    "path": "/",
}

if settings.COOKIE_DOMAIN:
    COOKIE_KWARGS["domain"] = settings.COOKIE_DOMAIN


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({"id": user.id, "username": user.username, "email": user.email})


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Cloudflare turnstile 驗證
        require_turnstile(request)

        # 註冊帳號
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Cloudflare turnstile 驗證
        require_turnstile(request)

        # 驗證帳密
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        # 更新最後登入時間
        update_last_login(None, user)

        # 產生 token
        refresh_token_obj = RefreshToken.for_user(user)
        access_token_obj = refresh_token_obj.access_token

        res = Response(
            {
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                }
            },
            status=status.HTTP_200_OK,
        )

        # Access Token
        res.set_cookie(
            key="hpytra_access",
            value=str(access_token_obj),
            **COOKIE_KWARGS,
        )

        # Refresh Token
        res.set_cookie(
            key="hpytra_refresh",
            value=str(refresh_token_obj),
            **COOKIE_KWARGS,
        )

        return res


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        res = Response(status=status.HTTP_204_NO_CONTENT)
        res.delete_cookie(
            key="hpytra_access",
            path="/",
        )
        res.delete_cookie(
            key="hpytra_refresh",
            path="/",
        )
        return res


class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get("hpytra_refresh")

        if not refresh_token:
            raise AuthenticationFailed("No refresh token")

        try:
            refresh_token_obj = RefreshToken(refresh_token)
            access_token_obj = refresh_token_obj.access_token

            user_id = refresh_token_obj["user_id"]
            user = User.objects.get(id=user_id)
        except TokenError:
            raise AuthenticationFailed("Invalid refresh token")

        res = Response(
            {
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                }
            },
            status=status.HTTP_200_OK,
        )

        res.set_cookie(
            key="hpytra_access",
            value=str(access_token_obj),
            **COOKIE_KWARGS,
        )

        return res


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            status=status.HTTP_200_OK,
        )
