"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/app/lib/authStore";
import { getMe, refresh } from "@/app/lib/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setInitialized, logout } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await getMe();
        setUser(user);
      } catch {
        try {
          const user = await refresh(); // 還原已登入狀態
          setUser(user);
        } catch {
          logout();
        }
      } finally {
        setInitialized();
      }
    };

    initAuth();
  }, []);

  return <>{children}</>;
}
