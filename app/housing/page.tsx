"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PrimaryTabs from "@/components/PrimaryTabs";
import { supabase } from "@/lib/supabaseClient";

type HousingPost = {
  id: string;
  created_at: string;
  user_id: string;

  post_type: "roommate" | "sublease";
  title: string;
  description: string | null;

  grad_year: number | null;
  new_to_campus: boolean | null;

  budget_min: number | null;
  budget_max: number | null;

  move_in_date: string | null;
  location: string | null;

  contact_method: string | null;
  contact_value: string | null;
};

export default function HousingPage() {
  const [sessionReady, setSessionReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  const [activeType, setActiveType] = useState<"roommate" | "sublease">("roommate");
  const [gradYear, setGradYear] = useState<string>("");
  const [newToCampusOnly, setNewToCampusOnly] = useState(false);

  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<HousingPost[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const years = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, i) => y + i);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setIsAuthed(!!data.session);
      setSessionReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!mounted) return;
      setIsAuthed(!!session);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!isAuthed) {
        setPosts([]);
        setErrorMsg(null);
        return;
      }

      setLoading(true);
      setErrorMsg(null);

      let q = supabase
        .from("housing_posts")
        .select("*")
        .eq("post_type", activeType)
        .order("created_at", { ascending: false });

      if (gradYear) q = q.eq("grad_year", Number(gradYear));
      if (newToCampusOnly) q = q.eq("new_to_campus", true);

      const { data, error } = await q;

      if (!mounted) return;

      if (error) {
        setErrorMsg(error.message);
        setPosts([]);
      } else {
        setPosts((data ?? []) as HousingPost[]);
      }

      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [isAuthed, activeType, gradYear, newToCampusOnly]);

  const pill = (active: boolean) => ({
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: active ? "#111111" : "#ffffff",
    color: active ? "#ffffff" : "#111111",
    fontWeight: 900 as const,
    cursor: "pointer",
  });

  const card: React.CSSProperties = {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
    background: "#ffffff",
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <PrimaryTabs />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, margin: 0 }}>Housing</h1>
          <p style={{ marginTop: 6, color: "#4b5563", fontWeight: 600 }}>
            Find roommates or post a sublease.
          </p>
        </div>

        <Link
          href="/housing/new"
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            background: "#111111",
            color: "#ffffff",
            textDecoration: "none",
            fontWeight: 900,
            height: "fit-content",
          }}
        >
          Post in Housing
        </Link>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <button style={pill(activeType === "roommate")} onClick={() => setActiveType("roommate")}>
          Find Roommates
        </button>
        <button style={pill(activeType === "sublease")} onClick={() => setActiveType("sublease")}>
          Subleases
        </button>
      </div>

      <div
        style={{
          marginTop: 14,
          padding: 14,
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          background: "#fafafa",
        }}
      >
        <div style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 900 }}>Grad year</span>
          <select
            value={gradYear}
            onChange={(e) => setGradYear(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
          >
            <option value="">All</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 22 }}>
          <input
            type="checkbox"
            checked={newToCampusOnly}
            onChange={(e) => setNewToCampusOnly(e.target.checked)}
          />
          <span style={{ fontWeight: 900 }}>New to campus only</span>
        </label>
      </div>

      {sessionReady && !isAuthed ? (
        <div style={{ marginTop: 16, ...card }}>
          <b>You must be logged in to view Housing posts.</b>
          <div style={{ marginTop: 6, color: "#4b5563" }}>
            Go to <Link href="/login">/login</Link>, sign in, then come back here.
          </div>
        </div>
      ) : null}

      {isAuthed ? (
        <div style={{ marginTop: 16 }}>
          {loading ? (
            <div style={card}>
              <b>Loading…</b>
            </div>
          ) : errorMsg ? (
            <div style={{ ...card, background: "#fee2e2" }}>
              <b>Error:</b> {errorMsg}
            </div>
          ) : posts.length === 0 ? (
            <div style={card}>
              <b>No posts match your filters yet.</b>
              <div style={{ marginTop: 6, color: "#4b5563" }}>
                Try switching tabs, clearing filters, or post the first one.
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {posts.map((p) => (
                <div key={p.id} style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>{p.title}</div>
                    <div style={{ color: "#6b7280", fontWeight: 800 }}>
                      {new Date(p.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {p.description ? (
                    <div style={{ marginTop: 8, lineHeight: 1.45 }}>{p.description}</div>
                  ) : null}

                  <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", color: "#374151", fontWeight: 800 }}>
                    {p.grad_year ? <span>Grad: {p.grad_year}</span> : null}
                    {p.new_to_campus ? <span>New to campus</span> : null}
                    {p.location ? <span>Location: {p.location}</span> : null}
                    {p.move_in_date ? <span>Move-in: {p.move_in_date}</span> : null}
                    {p.budget_min || p.budget_max ? (
                      <span>
                        Budget: {p.budget_min ?? "?"}–{p.budget_max ?? "?"}
                      </span>
                    ) : null}
                  </div>

                  {p.contact_method || p.contact_value ? (
                    <div style={{ marginTop: 10, padding: 10, borderRadius: 12, background: "#f3f4f6" }}>
                      <b>Contact:</b> {p.contact_method ?? "message"}
                      {p.contact_value ? ` — ${p.contact_value}` : ""}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
