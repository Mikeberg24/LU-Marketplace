"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] =
    useState<null | { type: "ok" | "err"; msg: string }>(null);

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setStatus({ type: "err", msg: "Enter a valid email address." });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });

      if (error) throw error;

      setStatus({
        type: "ok",
        msg: "Check your email for a verification link to finish signing in.",
      });
      setEmail("");
    } catch (err: any) {
      setStatus({
        type: "err",
        msg: err?.message || "Something went wrong — try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={s.page}>
      {/* Subtle flame / LU accent */}
      <div style={s.bg} aria-hidden />

      {/* Header */}
      <header style={s.header}>
        <div style={s.brand}>
          <div style={s.logo} />
          <div>
            <div style={s.brandName}>Flames Exchange</div>
            <div style={s.brandSub}>LU Marketplace</div>
          </div>
        </div>

        <nav style={s.nav}>
          <Link href="/marketplace" style={s.navLink}>Marketplace</Link>
          <Link href="/housing" style={s.navLink}>Housing</Link>
          <Link href="/sell" style={s.navLink}>Post</Link>
        </nav>
      </header>

      {/* Hero */}
      <section style={s.hero}>
        <div>
          <h1 style={s.h1}>A verified marketplace for Liberty students.</h1>

          <p style={s.lead}>
            Flames Exchange is the LU marketplace for buying, selling, and finding housing —
            built to be simple, trusted, and spam-free.
          </p>

          {/* CTAs */}
          <div style={s.ctaRow}>
            <Link href="/marketplace" style={s.ctaPrimary}>
              Browse Marketplace
            </Link>

            <Link href="/housing" style={s.ctaSecondary}>
              Browse Housing
            </Link>
          </div>

          <div style={s.note}>
            Posting and messaging require email verification to keep listings legitimate.
          </div>
        </div>

        {/* Verification */}
        <aside style={s.card}>
          <div style={s.cardTitle}>Get verified</div>
          <div style={s.cardSub}>
            Verify your email to post listings, message users, and access housing.
          </div>

          <form onSubmit={onVerify} style={s.form}>
            <label style={s.label}>Email</label>
            <input
              type="email"
              placeholder="you@liberty.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={s.input}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                ...s.verifyBtn,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Sending…" : "Verify Email"}
            </button>

            {status && (
              <div
                style={{
                  ...s.status,
                  borderColor:
                    status.type === "ok"
                      ? "rgba(16,185,129,.35)"
                      : "rgba(239,68,68,.35)",
                }}
              >
                {status.msg}
              </div>
            )}

            <div style={s.privacy}>
              No spam. No sharing. Used only for verification.
            </div>
          </form>
        </aside>
      </section>

      {/* Why */}
      <section style={s.section}>
        <h2 style={s.h2}>Why verification matters</h2>
        <p style={s.p}>
          Housing and buy/sell only work when people are real. Email verification
          helps reduce spam, fake listings, and sketchy messages.
        </p>
      </section>

      <footer style={s.footer}>
        <div>© {new Date().getFullYear()} Flames Exchange</div>
        <div style={s.footerLinks}>
          <Link href="/marketplace" style={s.footerLink}>Marketplace</Link>
          <Link href="/housing" style={s.footerLink}>Housing</Link>
        </div>
      </footer>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    maxWidth: 1120,
    margin: "0 auto",
    padding: "36px 24px 28px",
  },

  bg: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    background:
      "radial-gradient(500px 500px at -120px 260px, rgba(255,88,24,.14), transparent 70%), radial-gradient(500px 500px at calc(100% + 120px) 120px, rgba(255,140,48,.12), transparent 70%)",
  },

  header: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 24,
    borderBottom: "1px solid rgba(0,0,0,.08)",
    marginBottom: 48,
  },

  brand: { display: "flex", gap: 12, alignItems: "center" },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background:
      "radial-gradient(circle at 30% 30%, rgba(255,88,24,.35), transparent 60%), rgba(0,0,0,.9)",
  },
  brandName: { fontWeight: 900, letterSpacing: "-0.02em" },
  brandSub: { fontSize: 12, opacity: 0.7 },

  nav: { display: "flex", gap: 16 },
  navLink: { textDecoration: "none", fontSize: 14, opacity: 0.85 },

  hero: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 48,
    marginBottom: 72,
  },

  h1: { fontSize: 44, lineHeight: 1.1, marginBottom: 20 },
  lead: {
    fontSize: 17,
    lineHeight: 1.6,
    opacity: 0.82,
    maxWidth: 560,
    marginBottom: 32,
  },

  ctaRow: {
    display: "flex",
    gap: 16,
    marginBottom: 28,
  },

  ctaPrimary: {
    padding: "14px 20px",
    borderRadius: 12,
    background: "rgba(0,0,0,.9)",
    color: "white",
    textDecoration: "none",
    fontWeight: 800,
  },

  ctaSecondary: {
    padding: "14px 20px",
    borderRadius: 12,
    border: "2px solid rgba(0,0,0,.85)",
    textDecoration: "none",
    fontWeight: 800,
    color: "rgba(0,0,0,.85)",
    background: "transparent",
  },

  note: { fontSize: 13, opacity: 0.7 },

  card: {
    border: "1px solid rgba(0,0,0,.12)",
    borderRadius: 16,
    padding: 20,
    background: "rgba(255,255,255,.85)",
  },

  cardTitle: { fontWeight: 900, marginBottom: 6 },
  cardSub: { fontSize: 13, opacity: 0.75, marginBottom: 16 },

  form: { display: "flex", flexDirection: "column", gap: 12 },
  label: { fontSize: 12, fontWeight: 800 },
  input: {
    padding: "12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,.18)",
  },

  verifyBtn: {
    padding: "12px",
    borderRadius: 10,
    background: "rgba(0,0,0,.9)",
    color: "white",
    fontWeight: 800,
  },

  status: {
    padding: "10px",
    borderRadius: 10,
    border: "1px solid",
    fontSize: 13,
  },

  privacy: { fontSize: 12, opacity: 0.65 },

  section: {
    paddingTop: 56,
    paddingBottom: 56,
    borderTop: "1px solid rgba(0,0,0,.08)",
  },

  h2: { fontSize: 20, marginBottom: 10 },
  p: { maxWidth: 700, lineHeight: 1.7, opacity: 0.8 },

  footer: {
    marginTop: 48,
    paddingTop: 24,
    borderTop: "1px solid rgba(0,0,0,.08)",
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    opacity: 0.8,
  },

  footerLinks: { display: "flex", gap: 14 },
  footerLink: { textDecoration: "none", opacity: 0.8 },
};
