"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Status = null | { type: "ok" | "err"; msg: string };

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const trimmed = useMemo(() => email.trim().toLowerCase(), [email]);
  const looksValid = useMemo(() => trimmed.includes("@") && trimmed.includes("."), [trimmed]);

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    if (!looksValid) {
      setStatus({ type: "err", msg: "Enter a valid email address." });
      return;
    }

    setLoading(true);
    try {
      // Magic link / OTP
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo:
            typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        },
      });

      if (error) throw error;

      setStatus({
        type: "ok",
        msg: "Check your email for a secure sign-in link. You’ll be verified in seconds.",
      });
      setEmail("");
    } catch (err: any) {
      setStatus({
        type: "err",
        msg: err?.message || "Could not send verification email. Try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "calc(100vh - 40px)" }}>
      {/* HERO */}
      <section
        className="card"
        style={{
          marginTop: 18,
          padding: 0,
          overflow: "hidden",
          border: "1px solid rgba(15,23,42,.10)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr .8fr",
            gap: 18,
            padding: 26,
            alignItems: "center",
          }}
        >
          {/* Left */}
          <div>
            {/* Brand Row */}
            <div className="row" style={{ gap: 12, alignItems: "center", marginBottom: 12 }}>
              {/* Clean flame mark */}
              <div
                aria-hidden
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  border: "1px solid rgba(15,23,42,.12)",
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(180deg, rgba(255,106,0,.16), rgba(255,106,0,.02))",
                }}
              >
                <span style={{ fontSize: 22, lineHeight: "22px" }}>🔥</span>
              </div>

              <div>
                <div style={{ fontWeight: 950, fontSize: 18, letterSpacing: -0.2 }}>
                  Flames Exchange
                </div>
                <div className="subtle" style={{ marginTop: 2 }}>
                  LU Marketplace • Marketplace + Housing
                </div>
              </div>
            </div>

            <h1
              className="h1"
              style={{
                margin: 0,
                fontSize: 56,
                lineHeight: 1.02,
                letterSpacing: -1.2,
              }}
            >
              A verified exchange for Liberty students.
            </h1>

            <p
              className="subtle"
              style={{
                marginTop: 12,
                fontSize: 18,
                maxWidth: 640,
              }}
            >
              Buy and sell with confidence, find housing faster, and keep spam out. Access is tied to
              email verification to protect the community.
            </p>

            {/* CTAs */}
            <div className="row" style={{ gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              <Link
                href="/marketplace"
                className="btn btnPrimary"
                style={{ padding: "12px 18px", fontWeight: 950 }}
              >
                Browse Marketplace
              </Link>

              <Link
                href="/housing"
                className="btn btnSoft"
                style={{
                  padding: "12px 18px",
                  fontWeight: 950,
                  border: "1px solid rgba(15,23,42,.18)",
                }}
              >
                Browse Housing
              </Link>
            </div>

            <div className="subtle" style={{ marginTop: 10 }}>
              Posting and messaging require email verification to keep listings legit.
            </div>
          </div>

          {/* Right: Verify card */}
          <div
            className="card"
            style={{
              padding: 18,
              border: "1px solid rgba(15,23,42,.10)",
              background: "rgba(255,255,255,.7)",
            }}
          >
            <div style={{ fontWeight: 950, fontSize: 18 }}>Get verified</div>
            <div className="subtle" style={{ marginTop: 6 }}>
              Enter your Liberty email. We’ll send a secure sign-in link.
            </div>

            <form onSubmit={onVerify} style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Email</div>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@liberty.edu"
                autoComplete="email"
              />

              <button
                type="submit"
                className="btn btnPrimary"
                disabled={loading}
                style={{ width: "100%", marginTop: 12, padding: "12px 14px", fontWeight: 950 }}
              >
                {loading ? "Sending..." : "Verify Email"}
              </button>
            </form>

            {status ? (
              <div
                className="card"
                style={{
                  marginTop: 12,
                  padding: 12,
                  border: "1px solid rgba(15,23,42,.12)",
                  background:
                    status.type === "ok" ? "rgba(34,197,94,.08)" : "rgba(239,68,68,.08)",
                  color: status.type === "ok" ? "#14532d" : "#7a1f1f",
                  fontWeight: 900,
                }}
              >
                {status.msg}
              </div>
            ) : null}

            <div className="subtle" style={{ marginTop: 10 }}>
              No spam. No sharing. Used only for verification.
            </div>
          </div>
        </div>

        {/* Bottom accent stripe (clean, not “ember”) */}
        <div
          aria-hidden
          style={{
            height: 8,
            background:
              "linear-gradient(90deg, rgba(255,106,0,.95), rgba(255,106,0,.30), rgba(15,23,42,.08))",
          }}
        />
      </section>

      {/* FOOTER */}
      <div
        className="subtle"
        style={{
          marginTop: 18,
          paddingBottom: 22,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontWeight: 900 }}>
          Have questions? Concerns? <span style={{ fontWeight: 700 }}>Michael Berg</span> •{" "}
          <a href="mailto:mberg11@liberty.edu" style={{ fontWeight: 900 }}>
            mberg11@liberty.edu
          </a>
        </div>

        <div style={{ opacity: 0.8 }}>Flames Exchange • LU Marketplace</div>
      </div>
    </div>
  );
}
