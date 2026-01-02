"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const run = async () => {
      // If you used OTP/magic-link, Supabase may include ?code=...
      const code = searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("exchangeCodeForSession error:", error);
          router.replace("/login?error=callback");
          return;
        }
      }
      const { data: userData } = await supabase.auth.getUser();

if (userData?.user) {
  await supabase.from("profiles").upsert({
    id: userData.user.id,
    display_name: userData.user.email?.split("@")[0] ?? "Liberty Student",
  });
}


      // After session is set, go back to marketplace
      router.replace("/marketplace");
    };

    run();
  }, [router, searchParams]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Signing you in…</h2>
      <p>You’ll be redirected automatically.</p>
    </div>
  );
}
