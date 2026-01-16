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
      {/* subtle flame accents (clean gradients, not cartoony) */}
      <div style={s.bg} aria-hidden />

      {/* Header */}
      <header style={s.header}>
        <div style={s.brand}>
          <div style={s.logo} aria-hidden />
          <div style={s.brandText}>
            <div style={s.brandName}>Flames Exchange</div>
            <div style={s.brandSub}>LU Marketplace</div>
          </div>
        </div>

        <nav style={s.nav}>
          <Link href="/marketplace" style={s.navLink}>
            Marketplace
          </Link>
          <Link href="/housing" style={s.navLink}>
            Housing
          </Link>
          <Link href="/sell" style={s.navLink}>
            Post
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroLeft}>
          <div style={s.kicker}>Verified • Student-only • Liberty</div>

          <h1 style={s.h1}>Flames Exchange</h1>

          <h2 style={s.subhead}>Liberty’s verified marketplace for students.</h2>

          <p style={s.lead}>
            Buy, sell, and find housing in one place — built to be simple, trusted, and spam-free.
          </p>

          <div style={s.ctaRow}>
            <Link href="/marketplace" style={s.ctaPrimary}>
              Browse Marketplace
              <span style={s.ctaIcon} aria-hidden>
                →
              </span>
            </Link>

            <Link href="/housing" style={s.ctaSecondary}>
              Browse Housing
              <span style={s.ctaIcon} aria-hidden>
                →
              </span>
            </Link>
          </div>

          <div style={s.note}>
            Posting and messaging require email verification to keep listings legitimate.
          </div>

          <div style={s.statsRow}>
            <div style={s.stat}>
              <div style={s.statTop}>Verified accounts</div>
              <div style={s.statBottom}>Less spam & fake listings</div>
            </div>
            <div style={s.stat}>
              <div style={s.statTop}>Housing ready</div>
              <div style={s.statBottom}>Roommates, sublets, leases</div>
            </div>
            <div style={s.stat}>
              <div style={s.statTop}>Fast browsing</div>
              <div style={s.statBottom}>Clean and simple UI</div>
            </div>
          </div>
        </div>

        {/* Verification card */}
        <aside style={s.card}>
          <div style={s.cardHeader}>
            <div>
              <div style={s.cardTitle}>Get verified</div>
              <div style={s.cardSub}>
                Verify your email to post listings, message users, and access housing.
              </div>
            </div>
            <div style={s.badge}>SECURE</div>
          </div>

          <form onSubmit={onVerify} style={s.form}>
            <label htmlFor="email" style={s.label}>
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@liberty.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              spellCheck={false}
              style={s.input}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                ...s.verifyBtn,
                opacity: loading ? 0.78 : 1,
                cursor: loading ? "not-allowed" : "pointer",
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
                  background:
                    status.type === "ok"
                      ? "rgba(16,185,129,.08)"
                      : "rgba(239,68,68,.08)",
                }}
              >
                {status.msg}
              </div>
            )}

            <div style={s.privacy}>
              No spam. No sharing. Used only for verification and essential account updates.
            </div>
          </form>

          <div style={s.cardRule} />

          <div style={s.cardWhy}>
            <div style={s.cardWhyTitle}>Why verification?</div>
            <div style={s.cardWhyText}>
              It reduces fake listings and makes messaging safer — especially for housing.
            </div>
          </div>
        </aside>
      </section>

      {/* Why section */}
      <section style={s.section}>
        <h2 style={s.h2}>Why Flames Exchange exists</h2>
        <p style={s.p}>
          Most campus marketplaces get messy fast. Flames Exchange stays clean by requiring verified
          accounts and keeping the experience simple.
        </p>

        <div style={s.features}>
          <div style={s.feature}>
            <div style={s.featureTitle}>Less noise</div>
            <div style={s.featureBody}>Verified accounts filter spam and low-effort posts.</div>
          </div>
          <div style={s.feature}>
            <div style={s.featureTitle}>More trust</div>
            <div style={s.featureBody}>People respond faster when listings feel legitimate.</div>
          </div>
          <div style={s.feature}>
            <div style={s.featureTitle}>Better housing</div>
            <div style={s.featureBody}>Roommates and sublets need accountability.</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <div>© {new Date().getFullYear()} Flames Exchange</div>
        <div style={s.footerLinks}>
          <Link href="/marketplace" style={s.footerLink}>
            Marketplace
          </Link>
          <Link href="/housing" style={s.footerLink}>
            Housing
          </Link>
          <Link href="/my-listings" style={s.footerLink}>
            My Listings
          </Link>
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
    padding: "38px 24px 28px",
    overflow: "hidden",
  },

  // Clean "flame" vibe using gradients only
  bg: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    background: `
      radial-gradient(520px 520px at -120px 280px, rgba(255, 88, 24, 0.14) 0%, rgba(255, 88, 24, 0.06) 42%, rgba(255, 88, 24, 0.00) 70%),
      radial-gradient(520px 520px at calc(100% + 120px) 140px, rgba(255, 140, 48, 0.12) 0%, rgba(255, 140, 48, 0.05) 42%, rgba(255, 140, 48, 0.00) 70%),
      radial-gradient(900px 520px at 50% -260px, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.00) 70%)
    `,
  },

  header: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingBottom: 22,
    borderBottom: "1px solid rgba(0,0,0,.08)",
  },

  brand: { display: "flex", alignItems: "center", gap: 12 },
  brandText: { display: "flex", flexDirection: "column" },

  // Small LU-ish mark (abstract, clean)
  logo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,.12)",
    background:
      "radial-gradient(circle at 30% 30%, rgba(255,88,24,.35) 0%, rgba(255,88,24,.10) 58%, rgba(255,88,24,0) 72%), rgba(0,0,0,.92)",
    boxShadow: "0 12px 30px rgba(0,0,0,.08)",
  },

  brandName: {
    fontWeight: 950,
    letterSpacing: "-0.03em",
    textTransform: "uppercase",
    lineHeight: 1.05,
  },
  brandSub: { fontSize: 12, opacity: 0.72, marginTop: 3 },

  nav: { display: "flex", gap: 16, flexWrap: "wrap" },
  navLink: { textDecoration: "none", fontSize: 14, opacity: 0.86 },

  hero: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 52,
    paddingTop: 44,
    paddingBottom: 56,
  },

  heroLeft: { paddingRight: 8 },

  kicker: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    fontSize: 12,
    fontWeight: 850,
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    opacity: 0.68,
    marginBottom: 14,
  },

  h1: {
    fontSize: 54,
    lineHeight: 1.02,
    letterSpacing: "-0.05em",
    margin: "0 0 10px 0",
  },

  subhead: {
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    opacity: 0.78,
    margin: "0 0 16px 0",
  },

  lead: {
    fontSize: 17,
    lineHeight: 1.7,
    opacity: 0.82,
    margin: "0 0 26px 0",
    maxWidth: 620,
  },

  ctaRow: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    marginBottom: 18,
  },

  ctaPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "14px 18px",
    borderRadius: 12,
    background: "rgba(0,0,0,.92)",
    color: "white",
    textDecoration: "none",
    fontWeight: 900,
    letterSpacing: "-0.01em",
    boxShadow: "0 18px 44px rgba(0,0,0,.14)",
    minWidth: 220,
  },

  ctaSecondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "14px 18px",
    borderRadius: 12,
    border: "2px solid rgba(0,0,0,.85)",
    color: "rgba(0,0,0,.88)",
    background: "rgba(255,255,255,.72)",
    textDecoration: "none",
    fontWeight: 900,
    letterSpacing: "-0.01em",
    minWidth: 220,
  },

  ctaIcon: { opacity: 0.85, fontWeight: 900 },

  note: { fontSize: 13, opacity: 0.70, lineHeight: 1.6, marginBottom: 22, maxWidth: 640 },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    maxWidth: 760,
    marginTop: 10,
  },

  stat: {
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,.10)",
    background: "rgba(255,255,255,.78)",
    backdropFilter: "blur(6px)",
    boxShadow: "0 16px 38px rgba(0,0,0,.06)",
  },
  statTop: { fontWeight: 950, letterSpacing: "-0.01em" },
  statBottom: { marginTop: 6, fontSize: 13, opacity: 0.75, lineHeight: 1.45 },

  card: {
    border: "1px solid rgba(0,0,0,.12)",
    borderRadius: 18,
    padding: 20,
    background: "rgba(255,255,255,.84)",
    backdropFilter: "blur(8px)",
    boxShadow: "0 20px 50px rgba(0,0,0,.10)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },

  cardTitle: {
    fontWeight: 950,
    letterSpacing: "-0.02em",
    fontSize: 16,
    textTransform: "uppercase",
  },
  cardSub: { marginTop: 8, fontSize: 13, opacity: 0.78, lineHeight: 1.5, maxWidth: 360 },

  badge: {
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,88,24,.35)",
    background: "rgba(255,88,24,.10)",
    opacity: 0.95,
    whiteSpace: "nowrap",
  },

  form: { marginTop: 14, display: "flex", flexDirection: "column", gap: 12 },

  label: {
    fontSize: 12,
    fontWeight: 900,
    opacity: 0.80,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },

  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,.18)",
    outline: "none",
    fontSize: 14,
    background: "white",
  },

  verifyBtn: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,.16)",
    background: "rgba(0,0,0,.92)",
    color: "white",
    fontWeight: 900,
    letterSpacing: "-0.01em",
    boxShadow: "0 16px 34px rgba(0,0,0,.16)",
  },

  status: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,.12)",
    fontSize: 13,
    lineHeight: 1.45,
  },

  privacy: { fontSize: 12, opacity: 0.66, lineHeight: 1.45 },

  cardRule: { height: 1, background: "rgba(0,0,0,.08)", margin: "16px 0" },
  cardWhy: { display: "flex", flexDirection: "column", gap: 6 },
  cardWhyTitle: { fontWeight: 950, letterSpacing: "-0.01em" },
  cardWhyText: { fontSize: 13, opacity: 0.75, lineHeight: 1.45 },

  section: {
    position: "relative",
    zIndex: 1,
    paddingTop: 38,
    paddingBottom: 38,
    borderTop: "1px solid rgba(0,0,0,.08)",
  },

  h2: { fontSize: 20, margin: "0 0 10px 0", fontWeight: 950, letterSpacing: "-0.02em" },
  p: { maxWidth: 820, lineHeight: 1.7, opacity: 0.82, margin: 0 },

  features: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    marginTop: 18,
  },

  feature: {
    padding: 14,
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,.10)",
    background: "rgba(255,255,255,.78)",
    backdropFilter: "blur(6px)",
  },

  featureTitle: { fontWeight: 950, letterSpacing: "-0.01em" },
  featureBody: { marginTop: 6, fontSize: 13, opacity: 0.75, lineHeight: 1.45 },

  footer: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 22,
    borderTop: "1px solid rgba(0,0,0,.08)",
    marginTop: 14,
    fontSize: 13,
    opacity: 0.82,
    flexWrap: "wrap",
  },

  footerLinks: { display: "flex", gap: 14, flexWrap: "wrap" },
  footerLink: { textDecoration: "none", opacity: 0.88 },
};
