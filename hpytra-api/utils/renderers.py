from rest_framework.renderers import JSONRenderer
from django.utils import timezone


# 統一 API 回傳格式
class StandardJSONRenderer(JSONRenderer):

    def render(self, data, accepted_media_type=None, renderer_context=None):

        response = renderer_context.get("response") if renderer_context else None

        # error: 已經由 exception handler 格式化
        if response and response.status_code >= 400:
            return super().render(data, accepted_media_type, renderer_context)

        # success: 統一格式輸出
        return super().render(
            {
                "success": True,
                "data": data,
                "message": None,
                "error": None,
                "meta": {"timestamp": timezone.now().isoformat()},
            }
        )
