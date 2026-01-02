import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: 32,
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: 40, marginBottom: 8 }}>Page not found</h1>
      <p style={{ color: "#444", marginBottom: 18 }}>
        That page doesn’t exist, or the listing may have been removed.
      </p>

      <Link
        href="/marketplace"
        style={{
          display: "inline-block",
          padding: "12px 16px",
          borderRadius: 12,
          border: "1px solid #111",
          background: "#111",
          color: "white",
          textDecoration: "none",
          fontWeight: 900,
        }}
      >
        Go to Marketplace
      </Link>
    </div>
  );
}
