"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [msg, setMsg] = useState("Signing you in...");

  useEffect(() => {
    const run = async () => {
      try {
        // Where to go after login
        const next = searchParams.get("next") || "/marketplace";
        const safeNext = next.startsWith("/") ? next : "/marketplace";

        // Exchange the code in the URL for a session + store it in local storage
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        if (error) {
          setMsg("Sign-in link failed. Please try again.");
          // bounce to login but keep the next param
          router.replace(`/login?next=${encodeURIComponent(safeNext)}`);
          return;
        }

        router.replace(safeNext);
      } catch {
        setMsg("Sign-in link failed. Please try again.");
        router.replace("/login");
      }
    };

    run();
  }, [router, searchParams]);

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "56px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>
        {msg}
      </h1>
      <p style={{ opacity: 0.75 }}>
        If this takes more than a few seconds, go back and request a new link.
      </p>
    </main>
  );
}
