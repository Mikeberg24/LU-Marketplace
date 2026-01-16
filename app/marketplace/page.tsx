"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string | null;
  location: string | null;
  course_code: string | null;
  image_url: string | null;
  created_at: string;
};

const CATEGORIES = [
  "All",
  "Textbooks & Academics",
  "Electronics",
  "Furniture",
  "Clothing",
  "Services",
  "Tickets",
  "Other",
];

function formatDate(dt: string) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const load = async () => {
    setLoading(true);
    setErr(null);

    const { data, error } = await supabase
      .from("listings")
      .select("id,title,price,category,condition,location,course_code,image_url,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setListings([]);
      setLoading(false);
      return;
    }

    setListings((data as Listing[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return listings.filter((l) => {
      const matchesCat = cat === "All" ? true : l.category === cat;

      if (!query) return matchesCat;

      const hay = [
        l.title,
        l.category,
        l.course_code,
        l.condition,
        l.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesCat && hay.includes(query);
    });
  }, [listings, q, cat]);

  return (
    <div className="container">
      {/* Header */}
      <div className="row" style={{ justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 className="h1">Marketplace</h1>
          <p className="subtle">Buy and sell with verified Liberty students.</p>
        </div>

        <Link className="btn btnPrimary" href="/sell">
          Post a Listing
        </Link>
      </div>

      {/* Filters */}
      <div className="card cardPad" style={{ marginTop: 16 }}>
        <div className="grid3">
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, category, or course (e.g., MATH 132)"
          />

          <select
            className="select"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="row" style={{ justifyContent: "flex-end" }}>
            <span className="badge">
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {err && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(239,68,68,.25)",
              background: "rgba(239,68,68,.08)",
              color: "#7a1f1f",
              fontWeight: 800,
            }}
          >
            {err}
          </div>
        )}
      </div>

      {/* Grid */}
      <div style={{ marginTop: 16 }}>
        {loading ? (
          <div className="card cardPad">Loading listings…</div>
        ) : filtered.length === 0 ? (
          <div className="card cardPad">
            <div style={{ fontWeight: 900, fontSize: 18 }}>No results</div>
            <div className="subtle">Try a different search or category.</div>
          </div>
        ) : (
          <div className="gridCards">
            {filtered.map((l) => (
              <Link
                key={l.id}
                href={`/listing/${l.id}`}
                className="card"
                style={{ textDecoration: "none", overflow: "hidden" }}
              >
                {/* IMAGE (NO CROP) */}
                <div
                  style={{
                    height: 220,
                    background: "#f8fafc",
                    borderBottom: "1px solid rgba(15,23,42,.10)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {l.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={l.image_url}
                      alt={l.title}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  ) : (
                    <div style={{ fontWeight: 900, color: "rgba(91,101,119,.9)" }}>
                      No photo
                    </div>
                  )}

                  {/* Price */}
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: "white",
                      borderRadius: 999,
                      padding: "6px 10px",
                      fontWeight: 950,
                      border: "1px solid rgba(15,23,42,.10)",
                      boxShadow: "0 6px 18px rgba(2,6,23,.08)",
                    }}
                  >
                    ${Number(l.price).toFixed(0)}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="cardPad">
                  <div style={{ fontWeight: 950, fontSize: 18 }}>{l.title}</div>

                  <div
                    style={{
                      marginTop: 6,
                      color: "rgba(91,101,119,.95)",
                      fontWeight: 800,
                    }}
                  >
                    {l.category}
                    {l.course_code ? ` • ${l.course_code}` : ""}
                  </div>

                  <div className="row" style={{ marginTop: 10 }}>
                    {l.condition && (
                      <span className="badge">Condition: {l.condition}</span>
                    )}
                    {l.location && (
                      <span className="badge">Pickup: {l.location}</span>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      color: "rgba(91,101,119,.9)",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {formatDate(l.created_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
