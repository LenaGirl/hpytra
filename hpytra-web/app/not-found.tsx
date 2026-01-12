"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000); // 3 秒後跳轉

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main>
      <div className="text-center">
        <h1>404</h1>
        <h2>找不到這個頁面</h2>
        <p>可能是網址錯誤，或內容已調整。</p>
        <p>3 秒後將自動回到首頁。</p>

        <button className="btn btn-primary" onClick={() => router.push("/")}>
          立即返回首頁
        </button>
      </div>
    </main>
  );
}
