from django.db import models
from django.conf import settings
import uuid


class Favorite(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.DO_NOTHING,
        db_column="user_id",  # 指定資料庫中 favorites 的 user_id 欄位
        related_name="favorites",  # 可用 user.favorites 反向查詢
    )

    hotel = models.ForeignKey(
        "accommodations.Hotel",
        on_delete=models.DO_NOTHING,
        db_column="hotel_id",  # 指定資料庫中 favorites 的 hotel_id 欄位
        related_name="favorites",  # 可用 hotel.favorites 反向查詢
    )

    created_at = models.DateTimeField(auto_now_add=True, blank=True)

    class Meta:
        db_table = "favorites"
        managed = False

    def __str__(self):
        return str(self.id)
