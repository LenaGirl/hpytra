import { authClient } from "@/app/lib/authClient";
import { useAuthStore } from "@/app/lib/authStore";

export async function login(
  identifier: string,
  password: string,
  turnstileToken?: string,
) {
  await logout(); // 確保先清理舊的登入狀態
  const res = await authClient.post("/api/auth/login/", {
    identifier,
    password,
    turnstile_token: turnstileToken,
  });
  return res.data.user;
}

export async function register(
  username: string,
  email: string,
  password: string,
  password2: string,
  turnstileToken?: string,
) {
  const res = await authClient.post("/api/auth/register/", {
    username,
    email,
    password,
    password2,
    turnstile_token: turnstileToken,
  });
  return res.data;
}

export async function getMe() {
  const res = await authClient.get("/api/auth/me/");
  return res.data;
}

export async function logout() {
  try {
    await authClient.post("/api/auth/logout/");
  } catch {
  } finally {
    useAuthStore.getState().logout();
  }
}

export async function refresh() {
  const res = await authClient.post("/api/auth/refresh/");
  return res.data.user;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  const res = await authClient.post("/api/auth/change-password/", {
    current_password: currentPassword,
    new_password: newPassword,
  });

  return res;
}
