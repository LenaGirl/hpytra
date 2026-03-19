import { notFound } from "next/navigation";

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string | null;
  error: { code: string; status: number } | null;
  meta: {
    timestamp: string;
  };
};

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

  if (!res.ok) {
    throw new Error(`HTTP error: ${res.status}`);
  }

  const response: ApiResponse<T> = await res.json();

  if (!response.success) {
    throw new Error(response.message ?? "API error");
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

  if (!res.ok) {
    throw new Error(`HTTP error: ${res.status}`);
  }

  // API 可能回傳空 body（如 204），避免 res.json() 在空內容時拋錯，所以先讀取文字再解析
  const text = await res.text();

  if (!text) {
    return null as T;
  }

  const response: ApiResponse<T> = JSON.parse(text);

  if (!response.success) {
    throw new Error(response.message ?? "API error");
  }

  return response.data;
}

export async function apiFetchOr404<T>(url: string): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${url}`, getFetchOptions());

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error(`HTTP error: ${res.status}`);
  }

  const response: ApiResponse<T> = await res.json();

  if (!response.success) {
    throw new Error(response.message ?? "API error");
  }

  return response.data;
}
