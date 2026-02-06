"use client";

import Link from "next/link";
import memberStyles from "./member.module.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/lib/authStore";
import { logout } from "@/app/lib/auth";
import { memberMenuItems } from "@/data/memberMenuItems";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, initialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !user) {
      router.replace("/");
    }
  }, [initialized, user, router]);

  const handleLogout = async () => {
    const ok = window.confirm("確定要登出嗎？");

    if (!ok) return;

    await logout();
    router.replace("/");
  };

  return (
    <div className={memberStyles["member-layout"]}>
      {/* 左側欄 ( 桌機 / 平板 ) */}
      <aside className={memberStyles["member-sidebar"]}>
        {!initialized && <div>載入中…</div>}

        {initialized && user && (
          <>
            <div className={memberStyles["member-profile"]}>
              {user && <MemberProfile user={user} />}
            </div>
            <nav>
              <ul className={memberStyles["member-list"]}>
                {memberMenuItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} prefetch={false}>
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button className="btn-text" onClick={handleLogout}>
                    [ 登出 ]
                  </button>
                </li>
              </ul>
            </nav>
          </>
        )}
      </aside>

      {/* 手機 */}
      <div className={memberStyles["member-mobile-profile"]}>
        {user && <MemberProfile user={user} />}
        <button className="btn-text" onClick={handleLogout}>
          [ 登出 ]
        </button>
      </div>
      <nav className={memberStyles["member-mobile-nav"]}>
        {memberMenuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={memberStyles["member-mobile-nav-item"]}
            prefetch={false}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* 右側內容 */}
      <main className={memberStyles["member-content"]}>
        {!initialized && <div>載入中…</div>}
        {initialized && user && children}
      </main>
    </div>
  );
}
function MemberProfile({ user }) {
  return (
    <>
      <svg
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.75}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
      <div className="member-name">{user.username}</div>
      <div className="member-email">{user.email}</div>
    </>
  );
}
