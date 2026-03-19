# One-stage build: 後端依賴單純，因此採用 one-stage 維持設定簡潔並方便部署

FROM python:3.12-slim

# 設定 Python 與 pip 執行環境
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000

WORKDIR /app

# 先複製依賴檔案，利用 Docker cache 避免程式碼變動時重裝套件
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# 再複製專案原始碼
COPY . .

# 對外提供服務的 port
EXPOSE 8000

# 啟動 Gunicorn，並指定 Django WSGI 入口
CMD ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn --bind 0.0.0.0:${PORT} core.wsgi:application"]

