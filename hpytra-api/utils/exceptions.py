from rest_framework.views import exception_handler
from django.utils import timezone


# 統一例外處理格式
def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        return response

    code = None
    message = None
    details = None

    if isinstance(response.data, dict):
        detail = response.data.get("detail")

        if detail is not None:
            if hasattr(detail, "code"):
                code = detail.code
            message = str(detail)
            details = None
        else:
            code = "validation_error"
            message = "Validation failed."
            details = response.data
    else:
        message = str(response.data)
        details = None

    response.data = {
        "success": False,
        "message": message,
        "error": {
            "code": code,
            "status": response.status_code,
            "details": details,
        },
    }

    return response
