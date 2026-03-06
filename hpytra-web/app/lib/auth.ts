import { apiFetchAuth } from "@/app/lib/apiClient";
import { useAuthStore } from "@/app/lib/authStore";

type User = {
  id: number;
  username: string;
  email: string;
};

export async function login(
  identifier: string,
  password: string,
  turnstileToken?: string,
): Promise<User> {
  await logout(); // 確保先清理舊的登入狀態

  const data = await apiFetchAuth<{ user: any }>("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({
      identifier,
      password,
      turnstile_token: turnstileToken,
    }),
  });

  return data.user;
}

export async function register(
  username: string,
  email: string,
  password: string,
  password2: string,
  turnstileToken?: string,
) {
  return apiFetchAuth("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify({
      username,
      email,
      password,
      password2,
      turnstile_token: turnstileToken,
    }),
  });
}

export async function getMe(): Promise<User> {
  return apiFetchAuth("/api/auth/me/");
}

export async function logout() {
  try {
    await apiFetchAuth("/api/auth/logout/", {
      method: "POST",
    });
  } catch {
  } finally {
    useAuthStore.getState().logout();
  }
}

export async function refresh(): Promise<User> {
  const data = await apiFetchAuth<{ user: any }>("/api/auth/refresh/", {
    method: "POST",
  });

  return data.user;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  return apiFetchAuth("/api/auth/change-password/", {
    method: "POST",
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
}
