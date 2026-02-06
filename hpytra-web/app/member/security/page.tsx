"use client";

import { useState } from "react";
import { changePassword } from "@/app/lib/auth";

export default function SecurityPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 阻止瀏覽器預設送出

    setMessage(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const form = e.currentTarget;

    /* 前端驗證 */
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("請填寫所有欄位");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setMessage("新密碼至少需要 8 碼");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("新密碼與確認密碼不一致");
      setLoading(false);
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);

      setMessage("密碼已成功更新");
      form.reset();
    } catch (err) {
      const data = err?.response?.data;
      if (data?.current_password?.length) {
        setMessage(data.current_password[0]);
      } else if (data?.new_password?.length) {
        setMessage(data.new_password[0]);
      } else {
        setMessage("發生錯誤，請稍後再試");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>變更密碼</h1>
      <form className="form-card-member" onSubmit={handleSubmit}>
        <input
          name="currentPassword"
          type="password"
          placeholder="目前密碼"
          className="form-input"
        />

        <input
          name="newPassword"
          type="password"
          placeholder="新密碼"
          className="form-input"
        />

        <input
          name="confirmPassword"
          type="password"
          placeholder="確認密碼"
          className="form-input"
        />

        <p className="form-message">{message}</p>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "更新中…" : "更新密碼"}
        </button>
      </form>
    </>
  );
}
