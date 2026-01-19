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

      // IMPORTANT: this finalizes the magic link session
      const { error } = await supabase.auth.getSession();

      if (error) {
        router.replace(`/login?next=${encodeURIComponent(safeNext)}`);
        return;
      }

      router.replace(safeNext);
    };

    finishLogin();
  }, [router, searchParams]);

  return <p style={{ padding: 40 }}>Signing you in…</p>;
}
