# Hpytra

## 目錄

- [專案概述](#專案概述)
- [專案架構](#專案架構)
- [系統架構](#系統架構)
- [架構演進](#架構演進)
- [核心功能](#核心功能)
- [技術重點](#技術重點)
- [部署與環境](#部署與環境)
- [專案亮點](#專案亮點)
- [未來優化方向](#未來優化方向)

## 專案概述

Hpytra 為旅遊住宿推薦平台，採前後端分離架構設計，提供住宿瀏覽、會員驗證與收藏功能，並建立住宿資料 data pipeline 與半自動化流程，提升資料建置效率與一致性。

本專案著重於後端 API 設計、資料庫建模、查詢邏輯實作與 data pipeline 建置，前端作為資料呈現與互動介面。

## 專案架構

```
hpytra/
├── hpytra-api # 後端 API 服務
├── hpytra-web # 前端應用程式
└── hpytra-databuild # 資料建置與半自動化流程
```

## 系統架構

- Frontend：使用者互動與資料呈現
- Backend API：系統邏輯與資料存取
- Data Build：資料清洗與半自動化處理
- Database：PostgreSQL 作為資料儲存層

## 架構演進

專案初期以單一應用快速完成基本功能，後續依實際使用需求與資料量增加，逐步進行架構調整：

- 重構為前後端分離架構
- 重整 API 結構與資料查詢邏輯
- 建立資料建置程式，負責資料抓取、清理與圖片篩選
- 導入 AI API 提升圖片篩選效率

透過上述調整，提升系統可維護性與後續擴充彈性。

## 核心功能

- 會員登入與身分驗證
- 住宿資料 data pipeline（外部 API 整合與資料清理）
- AI 輔助圖片篩選機制
- 住宿資料查詢與地圖瀏覽
- 使用者收藏清單管理
- 後台資料維護

## 技術重點

- 前後端分離架構
- RESTful API 設計與統一回傳格式
- 建立統一 API 例外處理與錯誤回應機制
- JWT + HttpOnly Cookie 認證機制
- Cloudflare Turnstile 後端驗證整合
- 建立住宿資料 data pipeline（抓取 → 清理 → AI 圖片篩選 → 人工審核 → 資料入庫）
- 使用 asyncio 建立非同步資料處理流程
- 整合 Google API 與 AI API 進行資料處理

## 部署與環境

- Frontend：Next.js（部署於 Vercel）
- Backend：Django（RESTful API，部署於 DigitalOcean App Platform）
- Database：PostgreSQL（Supabase）

## 專案亮點

- 建立半自動化住宿資料 data pipeline，整合外部 API、AI 圖片篩選與人工審核，降低人工資料整理成本
- 導入 asyncio 非同步資料處理流程，提升資料抓取與處理效率
- 將 AI API 整合至資料建置流程，提升圖片篩選效率
- 針對住宿搜尋與資料查詢進行效能優化，提升 API 回應效率
- 將原本單一應用重構為前後端分離架構，提升系統可維護性與擴展性
- 完成前後端分離部署（Vercel / DigitalOcean / Supabase）

## 未來優化方向

- 實作伺服器端分頁
- 探索語意搜尋或推薦機制
- 建立後端單元測試與 API 回應測試
- 持續優化資料建置流程與資料品質檢查機制
