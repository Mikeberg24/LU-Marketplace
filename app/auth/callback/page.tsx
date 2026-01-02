"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Supabase magic link/OAuth will set session cookies automatically on redirect.
    // We just send them back to the app.
    router.replace("/marketplace");
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">Signing you in…</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Redirecting back to the marketplace.
        </p>
      </div>
    </main>
  );
}
