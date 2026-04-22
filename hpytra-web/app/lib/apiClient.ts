import { notFound } from "next/navigation";

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  message: string | null;
  error: {
    code: string | null;
    status: number;
    details?: Record<string, string[] | string> | null;
  } | null;
};

/* 將 API 錯誤回應包裝成前端可直接使用的 Error 物件 */
function buildApiError(
  status: number,
  response?: {
    message?: string | null;
    error?: {
      code?: string | null;
      status?: number;
      details?: unknown;
    } | null;
  } | null,
) {
  const error = new Error(response?.message ?? `HTTP error: ${status}`);
  (error as any).status = response?.error?.status ?? status;
  (error as any).code = response?.error?.code ?? null;
  (error as any).details = response?.error?.details ?? null;
  return error;
}

async function parseResponse<T>(res: Response): Promise<ApiResponse<T> | null> {
  // API 可能回傳空 body（如 204），避免 res.json() 在空內容時拋錯，所以先讀取文字再解析
  const text = await res.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// 依執行環境選擇 API base URL：server-side 優先走 Docker 內部位址，browser 端走公開網址
function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return (
      process.env.INTERNAL_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      ""
    );
  }

  return process.env.NEXT_PUBLIC_API_BASE_URL || "";
}

// 設定 fetch 選項：server-side 關閉快取，避免 Next.js 在 build 階段預先寫入空的 API 結果
function getFetchOptions(): RequestInit {
  if (typeof window === "undefined") {
    return { cache: "no-store" };
  }

  return {};
}

export async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${url}`, getFetchOptions());

  const response = await parseResponse<T>(res);

  // HTTP 回應狀態為錯誤
  if (!res.ok) {
    throw buildApiError(res.status, response);
  }

  // 回應 body 為空，或沒有可用的 API JSON
  if (!response) {
    throw new Error(`HTTP error: ${res.status}`);
  }

  // API 已回應，但業務結果為失敗
  if (!response.success) {
    throw buildApiError(res.status, response);
  }

  return response.data;
}

export async function apiFetchAuth<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${url}`, {
    ...getFetchOptions(),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const response = await parseResponse<T>(res);

  if (!res.ok) {
    throw buildApiError(res.status, response);
  }

  if (!response) {
    return null as T;
  }

  if (!response.success) {
    throw buildApiError(res.status, response);
  }

  return response.data;
}

export async function apiFetchOr404<T>(url: string): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${url}`, getFetchOptions());

  if (res.status === 404) {
    notFound();
  }

  const response = await parseResponse<T>(res);

  if (!res.ok) {
    throw buildApiError(res.status, response);
  }

  if (!response) {
    throw new Error(`HTTP error: ${res.status}`);
  }

  if (!response.success) {
    throw buildApiError(res.status, response);
  }

  return response.data;
}
