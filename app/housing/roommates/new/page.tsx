"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PrimaryTabs from "@/components/PrimaryTabs";
import { supabase } from "@/lib/supabaseClient";

export default function NewRoommatePostPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState<string>("");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const t = title.trim();
    const d = description.trim();

    if (!t) return setErr("Please add a title.");
    if (!d) return setErr("Please add a short description.");

    setLoading(true);

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      setLoading(false);
      return setErr("You must be signed in.");
    }

    const b = budget.trim() ? Number(budget) : null;
    if (budget.trim() && Number.isNaN(b)) {
      setLoading(false);
      return setErr("Budget must be a number.");
    }

    const { error: insertErr } = await supabase.from("housing_posts").insert({
      user_id: user.id,
      post_type: "roommate",
      title: t,
      description: d,
      budget: b,
      location: location.trim() || null,
      contact: contact.trim() || null,
    });

    if (insertErr) {
      setLoading(false);
      return setErr(insertErr.message);
    }

    setLoading(false);
    router.push("/housing");
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

      <form onSubmit={submit} className="card cardPad" style={{ marginTop: 16 }}>
        <label style={{ fontWeight: 900 }}>Title</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Fall 2026 roommate"
          style={{ marginTop: 6 }}
        />

        <div style={{ marginTop: 14 }}>
          <label style={{ fontWeight: 900 }}>About you / what you want</label>
          <textarea
            className="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share what you're looking for, lifestyle, sleep schedule, etc."
            rows={7}
            style={{ marginTop: 6 }}
          />
        </div>

        <div className="grid2" style={{ marginTop: 14 }}>
          <div>
            <label style={{ fontWeight: 900 }}>Budget (per semester or month)</label>
            <input
              className="input"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Ex: 600"
              style={{ marginTop: 6 }}
              inputMode="numeric"
            />
          </div>

          <div>
            <label style={{ fontWeight: 900 }}>Location (optional)</label>
            <input
              className="input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: The Hill, Commons, Off-campus"
              style={{ marginTop: 6 }}
            />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={{ fontWeight: 900 }}>Contact (optional)</label>
          <input
            className="input"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Ex: Text 555-123-4567 or IG @username"
            style={{ marginTop: 6 }}
          />
          <div className="subtle" style={{ marginTop: 8 }}>
            Only share what you’re comfortable with.
          </div>
        </div>

        {err && (
          <div
            style={{
              marginTop: 14,
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

        <div className="row" style={{ justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
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
