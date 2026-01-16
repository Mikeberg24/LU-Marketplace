"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

async function uploadHousingImage(file: File, userId: string) {
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from("housing-images").upload(fileName, file, {
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("housing-images").getPublicUrl(fileName);
  return data.publicUrl;
}

export default function RoommateNewPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState(""); // maps to DB budget (integer)
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!title.trim()) return setErr("Please add a title.");
    if (!description.trim()) return setErr("Please describe what you’re looking for.");

    // budget is optional — but if provided it must be numeric
    if (budget.trim() && Number.isNaN(Number(budget))) return setErr("Budget must be a number.");

    setLoading(true);

    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;

      const user = authData.user;
      if (!user) {
        setLoading(false);
        return setErr("You must be signed in to post.");
      }

      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadHousingImage(imageFile, user.id);
      }

      const { error: insertErr } = await supabase.from("housing_posts").insert({
        user_id: user.id,
        post_type: "roommate",
        title: title.trim(),
        description: description.trim(),
        budget: budget.trim() ? Number(budget) : null,
        location: location.trim() || null,
        contact: contact.trim() || null,
        image_url: imageUrl,
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
            placeholder="Ex: Fall 2026 roommate"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label className="label">About you / what you want</label>
          <textarea
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share what you're looking for, lifestyle, sleep schedule, etc."
            style={{ minHeight: 140 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label className="label">Budget (per semester or month) (optional)</label>
          <input
            className="input"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Ex: 600"
            inputMode="numeric"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label className="label">Location (optional)</label>
          <input
            className="input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ex: The Hill, Commons, Off-campus"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label className="label">Contact (optional)</label>
          <input
            className="input"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Ex: Text 555-123-4567 or IG @username"
          />
          <div className="subtle" style={{ marginTop: 6 }}>
            Only share what you’re comfortable with.
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label className="label">Photo (optional)</label>
          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
          <div className="subtle" style={{ marginTop: 6 }}>
            A clear face photo works best (optional).
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
