from rest_framework_simplejwt.authentication import JWTAuthentication


# 使用 HttpOnly Cookie 驗證
class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        raw_token = request.COOKIES.get("hpytra_access")

        if raw_token is None:
            return None
        validated_token = self.get_validated_token(raw_token)

        return self.get_user(validated_token), validated_token
