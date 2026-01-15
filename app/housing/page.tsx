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
  contact: string | null;
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
      .select("id,created_at,user_id,post_type,title,description,contact")
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

      {/* Header */}
      <div className="row" style={{ justifyContent: "space-between", gap: 16, marginTop: 16 }}>
        <div>
          <h1 className="h1">Housing</h1>
          <p className="subtle">Find roommates or post a sublease.</p>
        </div>

        <div className="row" style={{ gap: 10 }}>
          <button className="btn btnSoft" onClick={load} disabled={loading} type="button">
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
          type="button"
          className={activeTab === "roommate" ? "btn btnPrimary" : "btn btnSoft"}
          onClick={() => setActiveTab("roommate")}
        >
          Find Roommates
        </button>

        <button
          type="button"
          className={activeTab === "sublease" ? "btn btnPrimary" : "btn btnSoft"}
          onClick={() => setActiveTab("sublease")}
        >
          Subleases
        </button>
      </div>

      {/* Error */}
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

      {/* Posts */}
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

                {p.description ? (
                  <div style={{ marginTop: 10, lineHeight: 1.5 }}>{p.description}</div>
                ) : (
                  <div className="subtle" style={{ marginTop: 10 }}>
                    No description provided.
                  </div>
                )}

                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 12,
                    background: "rgba(2,6,23,.04)",
                    border: "1px solid rgba(15,23,42,.10)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>
                    Contact:{" "}
                    <span style={{ fontWeight: 800 }}>
                      {p.contact ? p.contact : "Not provided"}
                    </span>
                  </div>

                  {p.contact ? (
                    <button
                      className="btn btnSoft"
                      type="button"
                      onClick={() => navigator.clipboard.writeText(p.contact!)}
                    >
                      Copy
                    </button>
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
