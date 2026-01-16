from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    自訂使用者模型
    之後可以在這裡擴充欄位（例如：avatar、role、is_premium）
    """
    pass
