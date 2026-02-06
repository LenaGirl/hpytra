"use client";

import { useAuthStore } from "@/app/lib/authStore";
import memberStyles from "./member.module.css";

export default function MemberPage() {
  const { user } = useAuthStore();

  return (
    <>
      <div className={memberStyles["member-page-content"]}>
        <p className={memberStyles["member-page-title"]}>
          歡迎回來，{user.username} 👋
        </p>
        <p>這裡是您的會員空間</p>
        <p>一起繼續探索您收藏的住宿吧！</p>
      </div>
    </>
  );
}
