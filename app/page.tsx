"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | { type: "ok" | "err"; msg: string }>(null);

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
      {/* Subtle flame accents (clean, not cartoony) */}
      <div style={s.bg} aria-hidden />

      {/* Header */}
      <header style={s.header}>
        <div style={s.brand}>
          <div style={s.logo} aria-hidden>
            <span style={s.logoInner} />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={s.brandName}>Flames Exchange</div>
            <div style={s.brandSub}>
              LU Marketplace <span style={s.dot}>•</span> Verified listings & housing
            </div>
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
        <div style={s.left}>
          <div style={s.kicker}>Verified • Student-only • Built for Liberty</div>

          <h1 style={s.h1}>
            Flames Exchange
            <span style={s.h1Light}> — the LU marketplace for listings and housing.</span>
          </h1>

          <p style={s.lead}>
            A clean, verified place to buy/sell and find housing without spam. Built to keep things legit.
          </p>

          {/* Primary CTAs (same style, more stand-out) */}
          <div style={s.ctaRow}>
            <Link href="/marketplace" style={s.ctaBtn}>
              Browse Marketplace
              <span style={s.ctaArrow} aria-hidden>
                →
              </span>
            </Link>

            <Link href="/housing" style={s.ctaBtn}>
              Browse Housing
              <span style={s.ctaArrow} aria-hidden>
                →
              </span>
            </Link>
          </div>

          <div style={s.miniProof}>
            <div style={s.miniItem}>
              <div style={s.miniTop}>Email verified</div>
              <div style={s.miniBottom}>Accountability for listings + housing</div>
            </div>
            <div style={s.miniItem}>
              <div style={s.miniTop}>Simple by design</div>
              <div style={s.miniBottom}>Fast navigation, less noise</div>
            </div>
          </div>
        </div>

        {/* Verification card */}
        <aside style={s.card}>
          <div style={s.cardTop}>
            <div>
              <div style={s.cardTitle}>Get verified</div>
              <div style={s.cardSub}>
                Verify your email to post, message, and keep the exchange trusted.
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@liberty.edu"
              autoComplete="email"
              spellCheck={false}
              style={s.input}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                ...s.verifyBtn,
                opacity: loading ? 0.86 : 1,
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
                    status.type === "ok" ? "rgba(16,185,129,.35)" : "rgba(239,68,68,.35)",
                  background:
                    status.type === "ok" ? "rgba(16,185,129,.08)" : "rgba(239,68,68,.08)",
                }}
              >
                {status.msg}
              </div>
            )}

            <div style={s.privacy}>
              No spam. No sharing. Used only for verification and essential account updates.
            </div>
          </form>
        </aside>
      </section>

      {/* Bottom section */}
      <section style={s.section}>
        <h2 style={s.h2}>Why verification exists</h2>
        <p style={s.p}>
          Housing and buy/sell only work when people are real. Email verification helps reduce fake posts,
          spam, and sketchy messages — so the marketplace has a backbone.
        </p>

        <div style={s.features}>
          <div style={s.feature}>
            <div style={s.featureTitle}>Less spam</div>
            <div style={s.featureBody}>Verified accounts cut down low-effort and fake postings.</div>
          </div>
          <div style={s.feature}>
            <div style={s.featureTitle}>More trust</div>
            <div style={s.featureBody}>Better replies when users know listings come from real people.</div>
          </div>
          <div style={s.feature}>
            <div style={s.featureTitle}>Safer housing</div>
            <div style={s.featureBody}>Roommates and sublets require accountability.</div>
          </div>
        </div>
      </section>

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
    padding: "28px 22px 24px",
    overflow: "hidden",
  },

  // Subtle flame accents as gradients (clean + professional)
  bg: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    background: `
      radial-gradient(520px 520px at -90px 260px, rgba(255, 88, 24, 0.18) 0%, rgba(255, 88, 24, 0.06) 42%, rgba(255, 88, 24, 0.00) 70%),
      radial-gradient(480px 480px at calc(100% + 70px) 120px, rgba(255, 140, 48, 0.16) 0%, rgba(255, 140, 48, 0.05) 42%, rgba(255, 140, 48, 0.00) 70%),
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
    paddingBottom: 18,
    borderBottom: "1px solid rgba(0,0,0,.10)",
  },

  brand: { display: "flex", alignItems: "center", gap: 12 },

  // Clean “LU / flame” mark (not cartoony): small, sharp, premium
  logo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,.12)",
    background:
      "radial-gradient(12px 12px at 28% 30%, rgba(255,88,24,.35) 0%, rgba(255,88,24,.10) 55%, rgba(255,88,24,0) 70%), rgba(255,255,255,.85)",
    boxShadow: "0 10px 24px rgba(0,0,0,.06)",
    position: "relative",
    overflow: "hidden",
  },
  logoInner: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(135deg, rgba(0,0,0,.88) 0%, rgba(0,0,0,.88) 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 100%)",
    opacity: 0.10,
  },

  brandName: {
    fontWeight: 950,
    letterSpacing: "-0.03em",
    textTransform: "uppercase",
    lineHeight: 1.05,
  },
  brandSub: { fontSize: 12, opacity: 0.72, marginTop: 2 },
  dot: { opacity: 0.55, margin: "0 6px" },

  nav: { display: "flex", gap: 14, flexWrap: "wrap" },
  navLink: {
    textDecoration: "none",
    fontSize: 14,
    opacity: 0.86,
    padding: "6px 8px",
    borderRadius: 8,
    border: "1px solid rgba(0,0,0,0)",
  },

  hero: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: 22,
    paddingTop: 26,
    paddingBottom: 18,
    alignItems: "start",
  },

  left: { paddingRight: 10 },

  kicker: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    fontSize: 12,
    fontWeight: 850,
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    opacity: 0.70,
    marginBottom: 10,
  },

  h1: {
    fontSize: 46,
    lineHeight: 1.06,
    letterSpacing: "-0.04em",
    margin: "0 0 12px 0",
  },
  h1Light: {
    opacity: 0.70,
    fontWeight: 750,
  },

  lead: {
    fontSize: 16,
    lineHeight: 1.65,
    opacity: 0.82,
    margin: "0 0 18px 0",
    maxWidth: 660,
  },

  // CTAs: same style, bold, clean, matched
  ctaRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    maxWidth: 620,
    marginTop: 8,
  },
  ctaBtn: {
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "14px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,.14)",
    background: "rgba(255,255,255,.90)",
    boxShadow: "0 16px 36px rgba(0,0,0,.08)",
    fontWeight: 900,
    letterSpacing: "-0.01em",
  },
  ctaArrow: { opacity: 0.75, fontWeight: 900 },

  miniProof: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 16,
    maxWidth: 620,
  },
  miniItem: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,.10)",
    background: "rgba(255,255,255,.78)",
    backdropFilter: "blur(3px)",
  },
  miniTop: { fontWeight: 950, letterSpacing: "-0.01em" },
  miniBottom: { marginTop: 6, fontSize: 13, opacity: 0.75, lineHeight: 1.45 },

  // Verification card (clean + premium)
  card: {
    border: "1px solid rgba(0,0,0,.14)",
    borderRadius: 14,
    padding: 16,
    background: "rgba(255,255,255,.78)",
    backdropFilter: "blur(6px)",
    boxShadow: "0 18px 44px rgba(0,0,0,.10)",
  },
  cardTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  cardTitle: { fontWeight: 950, letterSpacing: "-0.02em", fontSize: 16, textTransform: "uppercase" },
  cardSub: { marginTop: 6, fontSize: 13, opacity: 0.78, lineHeight: 1.5, maxWidth: 360 },

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

  form: { marginTop: 12, display: "flex", flexDirection: "column", gap: 10 },
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
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,.18)",
    outline: "none",
    fontSize: 14,
    background: "white",
  },
  verifyBtn: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 10,
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
  privacy: { fontSize: 12, opacity: 0.68, lineHeight: 1.45, marginTop: 2 },

  section: {
    position: "relative",
    zIndex: 1,
    paddingTop: 22,
    paddingBottom: 18,
    borderTop: "1px solid rgba(0,0,0,.10)",
    marginTop: 6,
  },
  h2: { fontSize: 18, letterSpacing: "-0.02em", margin: "0 0 8px 0", fontWeight: 950 },
  p: { margin: 0, opacity: 0.80, lineHeight: 1.7, maxWidth: 820 },

  features: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 14 },
  feature: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,.10)",
    background: "rgba(255,255,255,.80)",
    backdropFilter: "blur(4px)",
  },
  featureTitle: { fontWeight: 950, letterSpacing: "-0.01em" },
  featureBody: { marginTop: 6, fontSize: 13, opacity: 0.75, lineHeight: 1.45 },

  footer: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 18,
    borderTop: "1px solid rgba(0,0,0,.10)",
    marginTop: 10,
    fontSize: 13,
    opacity: 0.82,
    flexWrap: "wrap",
  },
  footerLinks: { display: "flex", gap: 12, flexWrap: "wrap" },
  footerLink: { textDecoration: "none", opacity: 0.88 },
};
