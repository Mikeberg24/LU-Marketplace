"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PrimaryTabs from "@/components/PrimaryTabs";
import { supabase } from "@/lib/supabaseClient";

type HousingPost = {
  id: string;
  created_at: string;
  user_id: string;
  post_type: "roommate" | "sublease" | string;
  title: string;
  description: string | null;
  price: number | null;
  location: string | null;
  image_url: string | null;
};

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}

export default function HousingPage() {
  const [activeTab, setActiveTab] = useState<"roommate" | "sublease">("roommate");

  const [posts, setPosts] = useState<HousingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);

    const { data, error } = await supabase
      .from("housing_posts")
      .select("id,created_at,user_id,post_type,title,description,price,location,image_url")
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setPosts([]);
      setLoading(false);
      return;
    }

    setPosts((data as HousingPost[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return posts.filter((p) => p.post_type === activeTab);
  }, [posts, activeTab]);

  const postHref = activeTab === "roommate" ? "/housing/roommates/new" : "/housing/new";
  const postLabel = activeTab === "roommate" ? "Post Roommate" : "Post Sublease";

  return (
    <div className="container">
      <PrimaryTabs />

      <div className="row" style={{ justifyContent: "space-between", gap: 16, marginTop: 16 }}>
        <div>
          <h1 className="h1">Housing</h1>
          <p className="subtle">Find roommates or post a sublease.</p>
        </div>

        <div className="row" style={{ gap: 10 }}>
          <button className="btn btnSoft" onClick={load} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <Link className="btn btnPrimary" href={postHref}>
            {postLabel}
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="row" style={{ gap: 10, marginTop: 16 }}>
        <button
          className={activeTab === "roommate" ? "btn btnPrimary" : "btn btnSoft"}
          onClick={() => setActiveTab("roommate")}
          type="button"
        >
          Find Roommates
        </button>

        <button
          className={activeTab === "sublease" ? "btn btnPrimary" : "btn btnSoft"}
          onClick={() => setActiveTab("sublease")}
          type="button"
        >
          Subleases
        </button>
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

      {/* List */}
      <div style={{ marginTop: 16 }}>
        {loading ? (
          <div className="card cardPad">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="card cardPad">
            <div style={{ fontWeight: 950, fontSize: 18 }}>
              No {activeTab === "roommate" ? "roommate" : "sublease"} posts yet
            </div>
            <div className="subtle">Be the first to post.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {filtered.map((p) => (
              <div key={p.id} className="card cardPad">
                <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontWeight: 950, fontSize: 18 }}>{p.title}</div>
                  <div className="subtle" style={{ fontWeight: 800 }}>
                    {formatDate(p.created_at)}
                  </div>
                </div>

                {p.image_url && activeTab === "sublease" ? (
                  <div
                    style={{
                      marginTop: 12,
                      height: 240,
                      background: "#f8fafc",
                      borderRadius: 14,
                      overflow: "hidden",
                      border: "1px solid rgba(15,23,42,.10)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image_url}
                      alt={p.title}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </div>
                ) : null}

                {p.description ? (
                  <div style={{ marginTop: 10, lineHeight: 1.5 }}>{p.description}</div>
                ) : null}

                <div className="row" style={{ gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  {p.location ? <span className="badge">Location: {p.location}</span> : null}

                  {activeTab === "sublease" && p.price != null ? (
                    <span className="badge">Rent: ${p.price}/mo</span>
                  ) : null}

                  {activeTab === "roommate" && p.price != null ? (
                    <span className="badge">Budget: ${p.price}</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
