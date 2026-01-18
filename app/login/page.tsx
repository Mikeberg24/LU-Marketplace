import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading…</div>}>
      <LoginClient />
    </Suspense>
  );
}
