"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PrimaryTabs from "@/components/PrimaryTabs";
import { supabase } from "@/lib/supabaseClient";

export default function RoommateNewPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState(""); // we’ll store as price for now
  const [contact, setContact] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!title.trim()) return setErr("Please add a title.");
    if (!description.trim()) return setErr("Please add a description.");
    if (!budget.trim() || Number.isNaN(Number(budget))) return setErr("Please enter a valid budget number.");

    setLoading(true);

    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;

      const user = authData.user;
      if (!user) {
        setLoading(false);
        return setErr("You must be signed in to post.");
      }

      // Insert into the SAME TABLE, just change post_type
      const { error: insertErr } = await supabase.from("housing_posts").insert({
        post_type: "roommate",
        title: title.trim(),
        description: `${description.trim()}\n\nContact: ${contact.trim() || "N/A"}`,
        contact: contact.trim() || null,
        location: location.trim() || null,
        price: Number(budget), // using price as budget for now (safe, since price exists)
        user_id: user.id,
      });

      if (insertErr) throw insertErr;

      router.push("/housing");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <PrimaryTabs />

      <div className="row" style={{ justifyContent: "space-between", gap: 16, marginTop: 16 }}>
        <div>
          <h1 className="h1">Find a Roommate</h1>
          <p className="subtle">Post what you’re looking for and how to reach you.</p>
        </div>

        <Link className="btn btnSoft" href="/housing">
          Back to Housing
        </Link>
      </div>

      <form onSubmit={onSubmit} className="card cardPad" style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <label className="label">Title</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Fall 2026 Roommate"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label className="label">About you / what you want</label>
          <textarea
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Grad year, habits, schedule, preferences, etc."
            style={{ minHeight: 140 }}
          />
        </div>

        <div className="grid3" style={{ marginBottom: 12 }}>
          <div>
            <label className="label">Budget (per semester or month)</label>
            <input
              className="input"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Ex: 600"
              inputMode="numeric"
            />
          </div>

          <div style={{ gridColumn: "span 2" as any }}>
            <label className="label">Location (optional)</label>
            <input
              className="input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Commons 2 / On-campus / Wards Rd"
            />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label className="label">Contact (optional)</label>
          <input
            className="input"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Ex: Text 555-555-5555 or IG @username"
          />
          <div className="subtle" style={{ marginTop: 6 }}>
            Only share what you’re comfortable with.
          </div>
        </div>

        {err && (
          <div
            style={{
              marginTop: 10,
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

        <div className="row" style={{ marginTop: 14, justifyContent: "flex-end", gap: 12 }}>
          <Link className="btn btnSoft" href="/housing">
            Cancel
          </Link>
          <button className="btn btnPrimary" type="submit" disabled={loading}>
            {loading ? "Posting..." : "Post Roommate"}
          </button>
        </div>
      </form>
    </div>
  );
}
