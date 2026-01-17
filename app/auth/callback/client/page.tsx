"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default function AuthCallbackClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [msg, setMsg] = useState("Finishing sign-in...");

  const nextPath = useMemo(() => {
    const n = params.get("next");
    if (!n || !n.startsWith("/")) return "/marketplace";
    return n;
  }, [params]);

  useEffect(() => {
    const run = async () => {
      try {
        const token_hash = params.get("token_hash");
        const type = params.get("type") as any;

        // If token_hash/type are present, verify OTP to create session
        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({ token_hash, type });
          if (error) throw error;
        }

        setMsg("Signed in! Redirecting...");
        router.replace(nextPath);
      } catch (e: any) {
        setMsg("Sign-in failed. Redirecting to login...");
        router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      }
    };

    run();
  }, [params, router, nextPath]);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h2 style={{ fontWeight: 800 }}>{msg}</h2>
      <p style={{ opacity: 0.7 }}>
        If you’re not redirected automatically, go back and try signing in again.
      </p>
    </main>
  );
}
