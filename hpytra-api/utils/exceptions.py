from rest_framework.views import exception_handler
from django.utils import timezone


# 統一例外處理格式
def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        return response

    code = None
    message = None

    if isinstance(response.data, dict):
        detail = response.data.get("detail")

        if hasattr(detail, "code"):
            code = detail.code
            message = detail
        else:
            message = detail or response.data
    else:
        message = response.data

    response.data = {
        "success": False,
        "data": None,
        "message": message,
        "error": {"code": code, "status": response.status_code},
        "meta": {"timestamp": timezone.now().isoformat()},
    }

    return response
