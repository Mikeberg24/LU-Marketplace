"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";


type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  created_at: string;
  image_url: string | null;
  image_path: string | null;
  views: number | null;
};

function formatDate(dt: string) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

export default function MyListingsPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async (uid: string) => {
    setLoading(true);
    setErr(null);

    const { data, error } = await supabase
      .from("listings")
      .select("id,title,price,category,created_at,image_url,image_path,views")
      .eq("user_id", uid)
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
    const run = async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;

      if (!uid) {
        router.replace("/login");
        return;
      }

      setUserId(uid);
      setEmail(data.user?.email ?? null);
      await load(uid);
    };

    run();
  }, [router]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return listings;

    return listings.filter((l) => {
      const hay = `${l.title} ${l.category}`.toLowerCase();
      return hay.includes(query);
    });
  }, [listings, q]);

  const deleteListing = async (id: string) => {
    const ok = confirm("Delete this listing? This also deletes the photo.");
    if (!ok) return;

    setDeletingId(id);
    setErr(null);

    // 1) get image_path
    const { data: row, error: fetchErr } = await supabase
      .from("listings")
      .select("image_path")
      .eq("id", id)
      .single();

    if (fetchErr) {
      setDeletingId(null);
      setErr(fetchErr.message);
      return;
    }

    const imagePath = (row?.image_path as string | null) ?? null;

    // 2) remove from storage if we have a path
    if (imagePath) {
      const { error: removeErr } = await supabase.storage
        .from("listing-images")
        .remove([imagePath]);

      if (removeErr) {
        setDeletingId(null);
        setErr(removeErr.message);
        return;
      }
    }

    // 3) delete row
    const { error: delErr } = await supabase.from("listings").delete().eq("id", id);

    if (delErr) {
      setDeletingId(null);
      setErr(delErr.message);
      return;
    }

    setListings((prev) => prev.filter((l) => l.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 className="h1">My Listings</h1>
          <p className="subtle">
            {email ? `Signed in as ${email}` : "Manage what you’ve posted."}
          </p>
        </div>

        <div className="row">
          <Link className="btn btnPrimary" href="/sell">
            Post a Listing
          </Link>
          <button
            className="btn btnSoft"
            onClick={() => userId && load(userId)}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="card cardPad" style={{ marginTop: 16 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your listings…"
            style={{ maxWidth: 420 }}
          />
          <span className="badge">
            {filtered.length} listing{filtered.length === 1 ? "" : "s"}
          </span>
        </div>

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
      </div>

      <div style={{ marginTop: 16 }}>
        {loading ? (
          <div className="card cardPad">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="card cardPad">
            <div style={{ fontWeight: 950, fontSize: 18 }}>No listings yet</div>
            <div className="subtle">Post your first one to get started.</div>
            <div style={{ marginTop: 12 }}>
              <Link className="btn btnPrimary" href="/sell">
                Post a Listing
              </Link>
            </div>
          </div>
        ) : (
          <div className="gridCards">
            {filtered.map((l) => (
              <div key={l.id} className="card" style={{ overflow: "hidden" }}>
                <Link
                  href={`/listing/${l.id}`}
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <div
                    style={{
                      height: 150,
                      background:
                        "linear-gradient(135deg, rgba(2,6,23,.06), rgba(2,6,23,.02))",
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
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ color: "rgba(91,101,119,.9)", fontWeight: 950 }}>
                        No photo
                      </div>
                    )}

                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        background: "rgba(255,255,255,.92)",
                        border: "1px solid rgba(15,23,42,.10)",
                        borderRadius: 999,
                        padding: "6px 10px",
                        fontWeight: 950,
                        boxShadow: "0 6px 18px rgba(2,6,23,.08)",
                      }}
                    >
                      ${Number(l.price).toFixed(0)}
                    </div>
                  </div>
                </Link>

                <div className="cardPad">
                  <div style={{ fontWeight: 950, fontSize: 18 }}>{l.title}</div>
                  <div className="subtle" style={{ fontWeight: 800, marginTop: 6 }}>
                    {l.category} • {formatDate(l.created_at)}
                  </div>

                  <div className="row" style={{ marginTop: 10 }}>
                    <span className="badge">Views: {l.views ?? 0}</span>
                  </div>

                  <div className="row" style={{ marginTop: 14, justifyContent: "space-between" }}>
                    <Link className="btn btnSoft" href={`/edit-listing/${l.id}`}>
                      Edit
                    </Link>

                    <button
                      className="btn"
                      onClick={() => deleteListing(l.id)}
                      disabled={deletingId === l.id}
                      style={{
                        background: "rgba(239,68,68,.08)",
                        borderColor: "rgba(239,68,68,.25)",
                      }}
                    >
                      {deletingId === l.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
