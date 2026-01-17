"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [msg, setMsg] = useState("Signing you in...");

  const safeNext = useMemo(() => {
    const next = searchParams.get("next") || "/marketplace";
    return next.startsWith("/") ? next : "/marketplace";
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const fail = () => {
      if (cancelled) return;
      setMsg("Sign-in link failed. Please request a new link.");
      router.replace(`/login?next=${encodeURIComponent(safeNext)}`);
    };

    const run = async () => {
      try {
        const code = searchParams.get("code");

        if (!code) return fail();

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) return fail();

        if (!cancelled) router.replace(safeNext);
      } catch {
        fail();
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams, safeNext]);

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "56px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>{msg}</h1>
      <p style={{ opacity: 0.7 }}>
        If this takes more than a few seconds, request a new link.
      </p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <CallbackInner />
    </Suspense>
  );
}
