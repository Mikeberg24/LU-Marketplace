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
      {/* Background flames (decor) */}
      <div style={s.bg} aria-hidden>
        <Flame style={s.flameLeft} />
        <Flame style={s.flameRight} />
        <div style={s.noise} />
      </div>

      {/* Top bar */}
      <header style={s.header}>
        <div style={s.brand}>
          <div style={s.mark} aria-hidden />
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
            Flames Exchange.
            <br />
            <span style={s.h1Muted}>The LU marketplace that doesn’t feel sketchy.</span>
          </h1>

          <p style={s.lead}>
            A tougher, cleaner marketplace for students — with real listings, real people, and less noise.
            Housing and buy/sell in one place.
          </p>

          <div style={s.ctaRow}>
            <Link href="/marketplace" className="btn btnPrimary" style={s.ctaPrimary}>
              Browse Marketplace
            </Link>
            <Link href="/housing" className="btn btnSoft" style={s.ctaSecondary}>
              Explore Housing
            </Link>
          </div>

          <div style={s.proofRow}>
            <div style={s.proofItem}>
              <div style={s.proofTop}>Email-verified</div>
              <div style={s.proofBottom}>Fewer fake listings</div>
            </div>
            <div style={s.proofItem}>
              <div style={s.proofTop}>Student-first</div>
              <div style={s.proofBottom}>Built for campus life</div>
            </div>
            <div style={s.proofItem}>
              <div style={s.proofTop}>Housing-ready</div>
              <div style={s.proofBottom}>Sublets + roommates</div>
            </div>
          </div>

          <div style={s.note}>
            Posting and messaging require verification — it keeps Flames Exchange trusted and spam-free.
          </div>
        </div>

        {/* Verification */}
        <aside style={s.panel}>
          <div style={s.panelTop}>
            <div style={s.panelTitle}>Get verified</div>
            <div style={s.panelBadge}>Secure</div>
          </div>

          <div style={s.panelSub}>
            Enter your email to verify your account and unlock posting + messaging.
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
              className="btn btnPrimary"
              disabled={loading}
              style={{
                ...s.verifyBtn,
                opacity: loading ? 0.85 : 1,
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

            <div style={s.privacy}>No spam. No sharing. Used only for verification and safety.</div>
          </form>

          <div style={s.panelRule} />

          <div style={s.panelWhy}>
            <div style={s.panelWhyTitle}>Why verification?</div>
            <div style={s.panelWhyText}>
              It reduces scams, filters spam, and makes messaging safer — especially for housing.
            </div>
          </div>
        </aside>
      </section>

      {/* Why section (tough / editorial) */}
      <section style={s.why}>
        <h2 style={s.h2}>Built for trust</h2>
        <p style={s.whyP}>
          Flames Exchange is simple on purpose: verified accounts, clean navigation, and listings that feel
          legit. No clutter, no weirdness.
        </p>

        <div style={s.rule} />

        <div style={s.bullets}>
          <div style={s.bullet}>
            <div style={s.bulletTitle}>Fewer scams</div>
            <div style={s.bulletBody}>Verified accounts reduce impersonation and fake posts.</div>
          </div>
          <div style={s.bullet}>
            <div style={s.bulletTitle}>Less noise</div>
            <div style={s.bulletBody}>Spam drops when users are tied to a real email.</div>
          </div>
          <div style={s.bullet}>
            <div style={s.bulletTitle}>Better housing</div>
            <div style={s.bulletBody}>Roommates, sublets, and leases need accountability.</div>
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

function Flame({ style }: { style: React.CSSProperties }) {
  // Simple flame SVG (decorative)
  return (
    <svg
      viewBox="0 0 120 240"
      width="120"
      height="240"
      style={style}
      role="presentation"
      focusable="false"
    >
      <path
        d="M60 10
           C78 40, 95 58, 92 92
           C90 120, 70 130, 72 160
           C74 190, 98 200, 90 225
           C82 250, 62 255, 60 255
           C58 255, 38 250, 30 225
           C22 200, 46 190, 48 160
           C50 130, 30 120, 28 92
           C25 58, 42 40, 60 10Z"
        fill="rgba(255, 95, 31, 0.14)"
      />
      <path
        d="M60 55
           C70 75, 80 88, 78 108
           C76 124, 64 132, 66 150
           C68 170, 82 176, 78 194
           C74 210, 62 214, 60 214
           C58 214, 46 210, 42 194
           C38 176, 52 170, 54 150
           C56 132, 44 124, 42 108
           C40 88, 50 75, 60 55Z"
        fill="rgba(255, 170, 65, 0.14)"
      />
    </svg>
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

  // Background layer
  bg: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
  },
  flameLeft: {
    position: "absolute",
    left: -30,
    top: 120,
    transform: "rotate(-10deg)",
    filter: "blur(0.2px)",
    opacity: 0.95,
  },
  flameRight: {
    position: "absolute",
    right: -40,
    top: 40,
    transform: "rotate(12deg) scaleX(-1)",
    filter: "blur(0.2px)",
    opacity: 0.95,
  },
  noise: {
    position: "absolute",
    inset: 0,
    background:
      "repeating-linear-gradient(0deg, rgba(0,0,0,0.02), rgba(0,0,0,0.02) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)",
    opacity: 0.35,
  },

  // Content above bg
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
  mark: {
    width: 12,
    height: 12,
    borderRadius: 2,
    background: "rgba(0,0,0,.92)",
    boxShadow: "0 0 0 4px rgba(255,95,31,.12)",
  },
  brandName: { fontWeight: 950, letterSpacing: "-0.03em", textTransform: "uppercase" },
  brandSub: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  dot: { opacity: 0.6, margin: "0 6px" },

  nav: { display: "flex", gap: 14, flexWrap: "wrap" },
  navLink: {
    textDecoration: "none",
    fontSize: 14,
    opacity: 0.86,
    borderBottom: "1px solid rgba(0,0,0,0)",
    paddingBottom: 2,
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
    gap: 8,
    alignItems: "center",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    opacity: 0.72,
    marginBottom: 10,
  },
  h1: {
    fontSize: 46,
    lineHeight: 1.03,
    letterSpacing: "-0.04em",
    margin: "0 0 12px 0",
  },
  h1Muted: {
    display: "inline-block",
    opacity: 0.72,
    fontWeight: 750,
  },
  lead: {
    fontSize: 16,
    lineHeight: 1.65,
    opacity: 0.82,
    margin: "0 0 18px 0",
    maxWidth: 640,
  },

  ctaRow: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
  ctaPrimary: { padding: "10px 14px", borderRadius: 6 },
  ctaSecondary: { padding: "10px 14px", borderRadius: 6 },

  proofRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    marginTop: 16,
    maxWidth: 700,
  },
  proofItem: {
    padding: 10,
    borderRadius: 10,
    background: "rgba(255,255,255,.85)",
    border: "1px solid rgba(0,0,0,.08)",
    backdropFilter: "blur(2px)",
  },
  proofTop: { fontWeight: 950, letterSpacing: "-0.01em" },
  proofBottom: { marginTop: 4, fontSize: 13, opacity: 0.72, lineHeight: 1.35 },

  note: { marginTop: 12, fontSize: 13, opacity: 0.72, maxWidth: 640 },

  panel: {
    border: "1px solid rgba(0,0,0,.14)",
    borderRadius: 12,
    padding: 16,
    background: "rgba(0,0,0,.02)",
    boxShadow: "0 10px 30px rgba(0,0,0,.06)",
  },
  panelTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  panelTitle: {
    fontWeight: 950,
    letterSpacing: "-0.02em",
    fontSize: 16,
    textTransform: "uppercase",
  },
  panelBadge: {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "6px 8px",
    borderRadius: 999,
    border: "1px solid rgba(255,95,31,.30)",
    background: "rgba(255,95,31,.10)",
    opacity: 0.95,
  },
  panelSub: { marginTop: 8, fontSize: 13, opacity: 0.78, lineHeight: 1.5 },

  form: { marginTop: 12, display: "flex", flexDirection: "column", gap: 10 },
  label: {
    fontSize: 12,
    fontWeight: 900,
    opacity: 0.78,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(0,0,0,.18)",
    outline: "none",
    fontSize: 14,
    background: "white",
  },
  verifyBtn: { width: "100%", padding: "10px 12px", borderRadius: 8 },

  status: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,.12)",
    fontSize: 13,
    lineHeight: 1.4,
  },
  privacy: { fontSize: 12, opacity: 0.65, lineHeight: 1.4, marginTop: 2 },

  panelRule: { height: 1, background: "rgba(0,0,0,.08)", margin: "14px 0" },
  panelWhy: { display: "flex", flexDirection: "column", gap: 6 },
  panelWhyTitle: { fontWeight: 950, letterSpacing: "-0.01em" },
  panelWhyText: { fontSize: 13, opacity: 0.75, lineHeight: 1.45 },

  why: { position: "relative", zIndex: 1, paddingTop: 22, paddingBottom: 18, borderTop: "1px solid rgba(0,0,0,.10)", marginTop: 6 },
  h2: { fontSize: 18, letterSpacing: "-0.02em", margin: "0 0 8px 0", fontWeight: 950, textTransform: "uppercase" },
  whyP: { margin: 0, opacity: 0.8, lineHeight: 1.65, maxWidth: 780 },

  rule: { height: 1, background: "rgba(0,0,0,.10)", margin: "14px 0" },

  bullets: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  bullet: {
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,255,255,.90)",
    border: "1px solid rgba(0,0,0,.10)",
    boxShadow: "0 10px 24px rgba(0,0,0,.05)",
    backdropFilter: "blur(2px)",
  },
  bulletTitle: { fontWeight: 950, letterSpacing: "-0.01em" },
  bulletBody: { marginTop: 6, fontSize: 13, opacity: 0.76, lineHeight: 1.45 },

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
