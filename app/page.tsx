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
      {/* Subtle brand glow */}
      <div style={s.bg} aria-hidden />

      {/* Header */}
      <header style={s.header}>
        <div style={s.brand}>
          {/* NEW LOGO MARK */}
          <div style={s.logo}>
            <span style={s.logoFlame} />
          </div>

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
          <h1 style={s.h1}>Flames Exchange</h1>

          <h2 style={s.subhead}>
            Liberty’s verified marketplace for students
          </h2>

          <p style={s.lead}>
            Buy, sell, and find housing in one place. Flames Exchange is built
            to stay clean, trusted, and focused on real student listings.
          </p>

          <div style={s.ctaRow}>
            <Link href="/marketplace" style={s.ctaPrimary}>
              Browse Marketplace
            </Link>

            <Link href="/housing" style={s.ctaSecondary}>
              Browse Housing
            </Link>
          </div>

          <p style={s.note}>
            Posting and messaging require email verification to keep listings legitimate.
          </p>
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
              style={{ ...s.verifyBtn, opacity: loading ? 0.7 : 1 }}
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

      {/* Reason (replaces ugly cards) */}
      <section style={s.reason}>
        <h3 style={s.reasonTitle}>Why Flames Exchange exists</h3>
        <p style={s.reasonText}>
          Campus marketplaces fall apart when nobody is accountable.
          Flames Exchange stays useful by verifying users and keeping
          the experience focused on real students and real listings —
          especially for housing.
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
    padding: "40px 24px 32px",
  },

  bg: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    background:
      "radial-gradient(600px 600px at -120px 280px, rgba(255,88,24,.12), transparent 70%), radial-gradient(600px 600px at calc(100% + 120px) 120px, rgba(255,140,48,.10), transparent 70%)",
  },

  header: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 28,
    borderBottom: "1px solid rgba(0,0,0,.08)",
  },

  brand: { display: "flex", gap: 14, alignItems: "center" },

  /* NEW LOGO */
  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    background: "rgba(0,0,0,.92)",
    position: "relative",
    boxShadow: "0 10px 30px rgba(0,0,0,.15)",
  },
  logoFlame: {
    position: "absolute",
    inset: 6,
    borderRadius: 10,
    background:
      "radial-gradient(circle at 35% 35%, rgba(255,120,40,.9), rgba(255,60,0,.65) 60%, rgba(0,0,0,.9) 61%)",
  },

  brandName: {
    fontWeight: 950,
    letterSpacing: "-0.03em",
    textTransform: "uppercase",
  },
  brandSub: { fontSize: 12, opacity: 0.7 },

  nav: { display: "flex", gap: 18 },
  navLink: { textDecoration: "none", fontSize: 14, opacity: 0.85 },

  hero: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 56,
    paddingTop: 56,
    paddingBottom: 64,
  },

  h1: {
    fontSize: 56,
    fontWeight: 950,
    letterSpacing: "-0.05em",
    marginBottom: 10,
  },
  subhead: {
    fontSize: 18,
    fontWeight: 800,
    opacity: 0.8,
    marginBottom: 18,
  },
  lead: {
    fontSize: 17,
    lineHeight: 1.7,
    opacity: 0.85,
    maxWidth: 620,
    marginBottom: 32,
  },

  ctaRow: { display: "flex", gap: 16, marginBottom: 24 },
  ctaPrimary: {
    padding: "14px 22px",
    borderRadius: 14,
    background: "rgba(0,0,0,.92)",
    color: "white",
    fontWeight: 900,
    textDecoration: "none",
  },
  ctaSecondary: {
    padding: "14px 22px",
    borderRadius: 14,
    border: "2px solid rgba(0,0,0,.9)",
    fontWeight: 900,
    textDecoration: "none",
    color: "rgba(0,0,0,.9)",
  },

  note: { fontSize: 13, opacity: 0.7 },

  card: {
    border: "1px solid rgba(0,0,0,.12)",
    borderRadius: 18,
    padding: 22,
    background: "rgba(255,255,255,.9)",
  },

  cardTitle: { fontWeight: 900, marginBottom: 6 },
  cardSub: { fontSize: 13, opacity: 0.75, marginBottom: 18 },

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

  reason: {
    paddingTop: 48,
    paddingBottom: 48,
    maxWidth: 720,
  },
  reasonTitle: { fontWeight: 900, marginBottom: 8 },
  reasonText: { lineHeight: 1.7, opacity: 0.82 },

  footer: {
    marginTop: 64,
    paddingTop: 28,
    borderTop: "1px solid rgba(0,0,0,.08)",
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    opacity: 0.8,
  },
  footerLinks: { display: "flex", gap: 16 },
  footerLink: { textDecoration: "none", opacity: 0.8 },
};
