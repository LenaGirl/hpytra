"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { register, login } from "@/app/lib/auth";
import { useAuthStore } from "@/app/lib/authStore";
import Turnstile from "@/app/ui/Turnstile";

export default function RegisterClient() {
  const [turnstileToken, setTurnstileToken] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/member";

  const { setUser } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = String(formData.get("username") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const password2 = String(formData.get("password2") ?? "");

    /* 前端驗證 */
    if (!username || !email || !password || !password2) {
      setMessage("請輸入帳號、Email、密碼與確認密碼");
      setLoading(false);
      return;
    }

    if (password !== password2) {
      setMessage("兩次輸入的密碼不一致");
      setLoading(false);
      return;
    }

    try {
      /* 註冊 */
      await register(username, email, password, password2, turnstileToken);

      /* 立刻登入 */
      const user = await login(username, password, turnstileToken);
      setUser(user);
      router.replace(redirect);
    } catch (err) {
      // 重置 Turnstile
      if (window.turnstile) {
        window.turnstile.reset();
      }
      setTurnstileToken("");

      const data = err?.response?.data;
      if (data?.username?.length) {
        setMessage(data.username[0]);
      } else if (data?.email?.length) {
        setMessage(data.email[0]);
      } else if (data?.password?.length) {
        setMessage(data.password[0]);
      } else {
        setMessage("註冊失敗，請稍後再試");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <form className="form-card" onSubmit={handleSubmit}>
        <h1 className="text-center">註冊</h1>

        <input
          name="username"
          type="username"
          placeholder="帳號"
          autoComplete="username"
          className="form-input"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          className="form-input"
        />

        <input
          name="password"
          type="password"
          placeholder="密碼（至少 8 碼）"
          autoComplete="new-password"
          className="form-input"
        />

        <input
          name="password2"
          type="password"
          placeholder="再次輸入密碼"
          autoComplete="new-password"
          className="form-input"
        />

        {message && <p className="form-message">{message}</p>}

        <Turnstile onVerify={setTurnstileToken} />

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "註 冊 中 …" : "註 冊"}
        </button>

        <p className="text-center">
          已有帳號？
          <Link
            href={`/login?redirect=${encodeURIComponent(redirect)}`}
            prefetch={false}
          >
            現在登入
          </Link>
        </p>
      </form>
    </div>
  );
}
