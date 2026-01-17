"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function LoginInner() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nextPath = useMemo(() => {
    const n = searchParams.get("next");
    return n && n.startsWith("/") ? n : "/marketplace";
  }, [searchParams]);

  async function sendMagicLink() {
    setStatus(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("Enter your email.");
      return;
    }

    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
        nextPath
      )}`;

      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) throw error;

      setStatus("Sent! Check your email for the sign-in link.");
      setEmail("");
    } catch (e: any) {
      setStatus(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "56px 16px" }}>
      <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 6 }}>
        Sign in
      </h1>
      <p style={{ opacity: 0.75, marginBottom: 24 }}>
        We’ll email you a one-time sign-in link.
      </p>

      <label style={{ display: "block", fontWeight: 700, marginBottom: 8 }}>
        Liberty email
      </label>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@liberty.edu"
        type="email"
        autoComplete="email"
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.15)",
          marginBottom: 14,
        }}
      />

      <button
        onClick={sendMagicLink}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 12,
          border: "none",
          fontWeight: 800,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Sending..." : "Send sign-in link"}
      </button>

      {status && (
        <p style={{ marginTop: 14, fontWeight: 600, opacity: 0.85 }}>
          {status}
        </p>
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}
