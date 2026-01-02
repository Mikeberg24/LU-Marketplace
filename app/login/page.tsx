"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // already signed in? bounce
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace("/marketplace");
    });

    const justConfirmed = sp.get("confirmed");
    if (justConfirmed) {
      setMsg("Confirmed. Redirecting…");
      router.replace("/marketplace");
    }
  }, [router, sp]);

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    const clean = email.trim();
    if (!clean) return setErr("Enter your email.");

    setSending(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: clean,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setSending(false);
      setErr(error.message);
      return;
    }

    setSending(false);
    setMsg("Check your email for the sign-in link.");
  };

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="card cardPad">
        <h1 className="h1" style={{ fontSize: 40 }}>Sign in</h1>
        <p className="subtle">
          We’ll email you a magic link. No password.
        </p>

        {err ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(239,68,68,.25)",
              background: "rgba(239,68,68,.08)",
              color: "#7a1f1f",
              fontWeight: 900,
            }}
          >
            {err}
          </div>
        ) : null}

        {msg ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(34,197,94,.25)",
              background: "rgba(34,197,94,.10)",
              color: "#14532d",
              fontWeight: 900,
            }}
          >
            {msg}
          </div>
        ) : null}

        <form onSubmit={sendLink} style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 950, marginBottom: 6 }}>Email</div>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@liberty.edu"
          />

          <div className="row" style={{ justifyContent: "space-between", marginTop: 14 }}>
            <Link className="btn btnSoft" href="/marketplace">
              Back
            </Link>

            <button className="btn btnPrimary" type="submit" disabled={sending}>
              {sending ? "Sending..." : "Send sign-in link"}
            </button>
          </div>
        </form>

        <div className="hr" />

        <div className="subtle" style={{ fontSize: 13 }}>
          Tip: use your Liberty email if you want this to feel “campus verified”.
        </div>
      </div>
    </div>
  );
}
