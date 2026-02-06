import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>載入中...</div>}>
      <LoginClient />
    </Suspense>
  );
}
