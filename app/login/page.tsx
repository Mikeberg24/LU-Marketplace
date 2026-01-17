"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function isLibertyEmail(email: string) {
  // Change this if you want to allow alumni domains, etc.
  return /@liberty\.edu$/i.test(email.trim());
}

function LoginInner() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nextPath = useMemo(() => {
    const n = searchParams.get("next");
    if (!n || !n.startsWith("/")) return "/marketplace";
    return n;
  }, [searchParams]);

  async function sendMagicLink() {
    const trimmed = email.trim().toLowerCase();
    setStatus(null);

    if (!trimmed) {
      setStatus("Enter your email address.");
      return;
    }

    // Optional: enforce Liberty email (recommended for QR flyer flow)
    if (!isLibertyEmail(trimmed)) {
      setStatus("Use your Liberty email (…@liberty.edu).");
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

      setStatus("Sent! Check your inbox (and spam) for the sign-in link.");
      // keep email in the box so they can resend easily
    } catch (e: any) {
      setStatus(e?.message ?? "Could not send the link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    // same function, just clearer button label
    await sendMagicLink();
  }

  return (
    <main
      style={{
        maxWidth: 520,
        margin: "0 auto",
        padding: "56px 16px",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 34, fontWeight: 900, marginBottom: 6 }}>
        Sign in
      </h1>
      <p style={{ opacity: 0.75, marginBottom: 24 }}>
        We’ll email you a one-time sign-in link.
      </p>

      <label style={{ display: "block", fontWeight: 800, marginBottom: 8 }}>
        Liberty email
      </label>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@liberty.edu"
        type="email"
        autoComplete="email"
        inputMode="email"
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMagicLink();
        }}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.18)",
          marginBottom: 14,
          outline: "none",
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
          fontWeight: 900,
          cursor: loading ? "not-allowed" : "pointer",
          background: "#111",
          color: "#fff",
        }}
      >
        {loading ? "Sending…" : "Send sign-in link"}
      </button>

      <button
        onClick={resend}
        disabled={loading || !email.trim()}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.15)",
          fontWeight: 800,
          cursor: loading || !email.trim() ? "not-allowed" : "pointer",
          background: "transparent",
          marginTop: 10,
        }}
      >
        Resend
      </button>

      <div style={{ marginTop: 18 }}>
        {status && (
          <p style={{ fontWeight: 700, opacity: 0.9, lineHeight: 1.35 }}>
            {status}
          </p>
        )}

        <p style={{ marginTop: 10, fontSize: 13, opacity: 0.65 }}>
          Tip: If the email opens inside Gmail’s preview browser, tap “Open in
          browser” for the smoothest sign-in.
        </p>
      </div>
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
