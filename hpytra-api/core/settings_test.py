from .settings import *

import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parent.parent / ".env.test", override=True)

DATABASES = {
    "default": dj_database_url.parse(
        os.environ["DATABASE_URL"],
        conn_max_age=0,
        conn_health_checks=False,
        ssl_require=True,
    )
}

# 不需自動建立test資料庫，使用已建立好之測試資料庫
DATABASES["default"]["TEST"] = {
    "NAME": DATABASES["default"]["NAME"],
}

DEBUG = False
