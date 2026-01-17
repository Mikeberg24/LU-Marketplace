"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function AuthCallbackClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [msg, setMsg] = useState("Finishing sign-in...");

  useEffect(() => {
    const run = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const code = params.get("code");
      const token_hash = params.get("token_hash");
      const type = params.get("type") as any;

      try {
        if (token_hash && type) {
          const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
          if (error) throw error;

          // If verifyOtp returns a session, set it
          if (data?.session) {
            await supabase.auth.setSession(data.session);
          }
        }

        // If it's a code flow, Supabase client will usually auto-handle session when opened from link,
        // but if not, just move forward.
        setMsg("Signed in! Redirecting...");
        router.replace("/marketplace");
      } catch (e: any) {
        setMsg("Sign-in failed. Please try again.");
        router.replace("/login");
      }
    };

    run();
  }, [params, router]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h2>{msg}</h2>
      <p>If you’re not redirected automatically, go back and try signing in again.</p>
    </div>
  );
}
