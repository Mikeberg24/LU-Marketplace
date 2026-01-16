"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type MarketplaceListing = {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  price: number | null;
  description: string | null;
  image_url: string | null;
};

type HousingPost = {
  id: string;
  created_at: string;
  user_id: string;
  post_type: "roommate" | "sublease" | string;
  title: string;
  description: string | null;
  location: string | null;
  contact: string | null;
  image_url: string | null;
  budget: number | null;
  rent: number | null;
};

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}

export default function MyListingsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"marketplace" | "housing">("marketplace");

  const [userId, setUserId] = useState<string | null>(null);

  const [marketplace, setMarketplace] = useState<MarketplaceListing[]>([]);
  const [housing, setHousing] = useState<HousingPost[]>([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);

    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;

      const user = authData.user;
      if (!user) {
        setUserId(null);
        setMarketplace([]);
        setHousing([]);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // Load marketplace listings
      const { data: mData, error: mErr } = await supabase
        .from("listings")
        .select("id,created_at,user_id,title,price,description,image_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (mErr) throw mErr;

      // Load housing posts
      const { data: hData, error: hErr } = await supabase
        .from("housing_posts")
        .select("id,created_at,user_id,post_type,title,description,location,contact,image_url,budget,rent")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (hErr) throw hErr;

      setMarketplace(Array.isArray(mData) ? (mData as MarketplaceListing[]) : []);
      setHousing(Array.isArray(hData) ? (hData as HousingPost[]) : []);
      setLoading(false);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load.");
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // keep it updated when login changes
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteMarketplace = async (id: string) => {
    if (!confirm("Delete this marketplace listing?")) return;
    try {
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) throw error;
      await load();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to delete.");
    }
  };

  const deleteHousing = async (id: string) => {
    if (!confirm("Delete this housing post?")) return;
    try {
      const { error } = await supabase.from("housing_posts").delete().eq("id", id);
      if (error) throw error;
      await load();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to delete.");
    }
  };

  const activeCount = useMemo(() => {
    return activeTab === "marketplace" ? marketplace.length : housing.length;
  }, [activeTab, marketplace.length, housing.length]);

  return (
    <div>
      {/* Header row */}
      <div className="row" style={{ justifyContent: "space-between", gap: 16, marginTop: 16 }}>
        <div>
          <h1 className="h1">My Listings</h1>
          <p className="subtle">Manage what you’ve posted (marketplace + housing).</p>
        </div>

        <div className="row" style={{ gap: 10 }}>
          <button className="btn btnSoft" onClick={load} disabled={loading} type="button">
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            className="btn btnPrimary"
            type="button"
            onClick={() => router.push(activeTab === "marketplace" ? "/sell" : "/housing")}
          >
            {activeTab === "marketplace" ? "Post Item" : "Go to Housing"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="row" style={{ gap: 10, marginTop: 16 }}>
        <button
          type="button"
          className={activeTab === "marketplace" ? "btn btnPrimary" : "btn btnSoft"}
          onClick={() => setActiveTab("marketplace")}
        >
          Marketplace ({marketplace.length})
        </button>

        <button
          type="button"
          className={activeTab === "housing" ? "btn btnPrimary" : "btn btnSoft"}
          onClick={() => setActiveTab("housing")}
        >
          Housing ({housing.length})
        </button>
      </div>

      {/* Sign in state */}
      {!userId && !loading && (
        <div className="card cardPad" style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 950, fontSize: 18 }}>Sign in to see your listings</div>
          <div className="subtle" style={{ marginTop: 6 }}>
            You need to be signed in to manage your posts.
          </div>
          <div className="row" style={{ marginTop: 12, gap: 10 }}>
            <Link className="btn btnPrimary" href="/login">
              Sign in
            </Link>
            <Link className="btn btnSoft" href="/marketplace">
              Back to Browse
            </Link>
          </div>
        </div>
      )}

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

      {/* List */}
      <div style={{ marginTop: 16 }}>
        {loading ? (
          <div className="card cardPad">Loading…</div>
        ) : userId && activeCount === 0 ? (
          <div className="card cardPad">
            <div style={{ fontWeight: 950, fontSize: 18 }}>
              No {activeTab === "marketplace" ? "marketplace" : "housing"} listings yet
            </div>
            <div className="subtle">Post one and it’ll show up here.</div>
          </div>
        ) : activeTab === "marketplace" ? (
          <div style={{ display: "grid", gap: 14 }}>
            {marketplace.map((l) => (
              <div key={l.id} className="card cardPad">
                <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontWeight: 950, fontSize: 18 }}>{l.title}</div>
                  <div className="subtle" style={{ fontWeight: 800 }}>
                    {formatDate(l.created_at)}
                  </div>
                </div>

                {l.image_url ? (
                  <img
                    src={l.image_url}
                    alt={l.title}
                    style={{ width: "100%", maxWidth: 360, marginTop: 12, borderRadius: 14, objectFit: "cover" }}
                  />
                ) : null}

                <div style={{ marginTop: 10, fontWeight: 900 }}>
                  Price: <span style={{ fontWeight: 800 }}>{l.price ?? "—"}</span>
                </div>

                {l.description ? (
                  <div style={{ marginTop: 8, lineHeight: 1.5 }}>{l.description}</div>
                ) : (
                  <div className="subtle" style={{ marginTop: 8 }}>
                    No description.
                  </div>
                )}

                <div className="row" style={{ marginTop: 14, gap: 10, justifyContent: "flex-end" }}>
                  <Link className="btn btnSoft" href={`/edit-listing/${l.id}`}>
                    Edit
                  </Link>
                  <button className="btn btnSoft" type="button" onClick={() => deleteMarketplace(l.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {housing.map((p) => (
              <div key={p.id} className="card cardPad">
                <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontWeight: 950, fontSize: 18 }}>
                    {p.title}{" "}
                    <span className="subtle" style={{ fontWeight: 900 }}>
                      ({p.post_type})
                    </span>
                  </div>
                  <div className="subtle" style={{ fontWeight: 800 }}>
                    {formatDate(p.created_at)}
                  </div>
                </div>

                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.title}
                    style={{ width: "100%", maxWidth: 360, marginTop: 12, borderRadius: 14, objectFit: "cover" }}
                  />
                ) : null}

                {/* Budget / Rent */}
                <div className="row" style={{ gap: 14, marginTop: 12, flexWrap: "wrap" }}>
                  {p.post_type === "roommate" ? (
                    <div style={{ fontWeight: 900 }}>
                      Budget: <span style={{ fontWeight: 800 }}>{p.budget ?? "—"}</span>
                    </div>
                  ) : (
                    <div style={{ fontWeight: 900 }}>
                      Rent: <span style={{ fontWeight: 800 }}>{p.rent ?? "—"}</span>
                    </div>
                  )}

                  <div style={{ fontWeight: 900 }}>
                    Location: <span style={{ fontWeight: 800 }}>{p.location ?? "—"}</span>
                  </div>
                </div>

                {p.description ? (
                  <div style={{ marginTop: 10, lineHeight: 1.5 }}>{p.description}</div>
                ) : (
                  <div className="subtle" style={{ marginTop: 10 }}>
                    No description.
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
                    Contact: <span style={{ fontWeight: 800 }}>{p.contact ?? "—"}</span>
                  </div>

                  {p.contact ? (
                    <button className="btn btnSoft" type="button" onClick={() => navigator.clipboard.writeText(p.contact!)}>
                      Copy
                    </button>
                  ) : null}
                </div>

                <div className="row" style={{ marginTop: 14, gap: 10, justifyContent: "flex-end" }}>
                  <Link className="btn btnSoft" href={`/housing/edit/${p.id}`}>
                    Edit
                  </Link>
                  <button className="btn btnSoft" type="button" onClick={() => deleteHousing(p.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
