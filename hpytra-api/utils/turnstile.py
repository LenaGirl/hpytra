import requests
import os
from rest_framework.exceptions import ValidationError


# Cloudflare turnstile
def verify_turnstile(request):
    secret_key = os.getenv("CLOUDFLARE_TURNSTILE_SECRET_KEY")
    url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
    token = request.data.get("turnstile_token")

    data = {
        "secret": secret_key,
        "response": token,
    }

    data["remoteip"] = (
        request.META.get("HTTP_CF_CONNECTING_IP")
        or request.META.get("HTTP_X_FORWARDED_FOR")
        or request.META.get("REMOTE_ADDR")
    )

    try:
        response = requests.post(url, data=data, timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Turnstile validation error: {e}")
        return {"success": False, "error-codes": ["internal-error"]}


def require_turnstile(request):
    validation = verify_turnstile(request)

    if not validation.get("success"):
        print(f"Turnstile validation failed: {validation.get('error-codes')}")
        raise ValidationError(
            {
                "detail": "安全驗證失敗",
                "errors": validation.get("error-codes"),
            }
        )
