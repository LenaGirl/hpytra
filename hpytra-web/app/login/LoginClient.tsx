"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/lib/authStore";
import { login } from "@/app/lib/auth";
import Turnstile from "@/app/ui/Turnstile";

export default function LoginClient() {
  const [turnstileToken, setTurnstileToken] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/member";

  const { setUser } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 阻止瀏覽器預設送出

    setMessage(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const identifier = String(formData.get("identifier") ?? "");
    const password = String(formData.get("password") ?? "");

    /* 前端驗證 */
    if (!identifier || !password) {
      setMessage("請輸入「 帳號 或 Email 」及「 密碼 」");
      setLoading(false);
      return;
    }

    try {
      const user = await login(identifier, password, turnstileToken);
      setUser(user);
      router.replace(redirect);
    } catch (err) {
      // 重置 Turnstile
      if (window.turnstile) {
        window.turnstile.reset();
      }
      setTurnstileToken("");

      setMessage("登入失敗，請確認「 帳號 或 Email 」及「 密碼 」");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <form className="form-card" onSubmit={handleSubmit}>
        <h1 className="text-center">登入</h1>

        <input
          name="identifier"
          placeholder="帳號 或 Email"
          autoComplete="username"
          className="form-input"
        />

        <input
          name="password"
          type="password"
          placeholder="密碼"
          autoComplete="current-password"
          className="form-input"
        />

        <p className="text-right">忘記密碼？</p>

        {message && <p className="form-message">{message}</p>}

        <Turnstile onVerify={setTurnstileToken} />

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "登 入 中 …" : "登 入"}
        </button>

        <p className="text-center">
          還沒有註冊帳號？
          <Link
            href={`/register?redirect=${encodeURIComponent(redirect)}`}
            prefetch={false}
          >
            現在註冊
          </Link>
        </p>
      </form>
    </div>
  );
}
