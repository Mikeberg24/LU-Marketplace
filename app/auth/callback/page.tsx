"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const finishLogin = async () => {
      const next = searchParams.get("next") || "/marketplace";
      const safeNext = next.startsWith("/") ? next : "/marketplace";

      // ✅ CORRECT Supabase v2 method
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      router.replace(error ? "/login" : safeNext);
    };

    finishLogin();
  }, [router, searchParams]);

  return <div style={{ padding: 24 }}>Signing you in…</div>;
}
