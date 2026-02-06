import { Suspense } from "react";
import RegisterClient from "./RegisterClient";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>載入中...</div>}>
      <RegisterClient />
    </Suspense>
  );
}
