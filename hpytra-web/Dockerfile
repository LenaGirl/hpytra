# Multi-stage build: 分離 install / build / runtime，縮小 image 並提升效能

# ----- Stage 1: 安裝依賴 -----
FROM node:22-alpine AS deps
WORKDIR /app

# 啟用 pnpm（透過 corepack）
RUN corepack enable

# 先複製依賴檔案，利用 Docker cache 避免程式碼變動時重裝套件
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# ----- Stage 2: 建置應用 -----
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable

# 使用已安裝好的依賴
COPY --from=deps /app/node_modules ./node_modules

# 再複製專案原始碼
COPY . .

# 注入 Next.js build 時使用的環境變數
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_GOOGLE_MAP_KEY
ARG NEXT_PUBLIC_GOOGLE_MAP_ID
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_GOOGLE_MAP_KEY=$NEXT_PUBLIC_GOOGLE_MAP_KEY
ENV NEXT_PUBLIC_GOOGLE_MAP_ID=$NEXT_PUBLIC_GOOGLE_MAP_ID
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY

RUN pnpm build

# ----- Stage 3: production 執行 -----
FROM node:22-alpine AS runner
WORKDIR /app

# 設定 production 模式
ENV NODE_ENV=production

RUN corepack enable

# 只複製 standalone 需要的檔案
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 對外提供服務的 port
EXPOSE 3000

# 啟動 Next.js standalone server（不使用 pnpm start）
CMD ["node", "server.js"]