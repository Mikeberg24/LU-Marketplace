"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PrimaryTabs from "@/components/PrimaryTabs";
import { supabase } from "@/lib/supabaseClient";

export default function NewHousingPostPage() {
  const router = useRouter();

  const [isAuthed, setIsAuthed] = useState(false);

  const [postType, setPostType] = useState<"roommate" | "sublease">("roommate");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [gradYear, setGradYear] = useState<string>("");
  const [newToCampus, setNewToCampus] = useState(false);

  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");

  const [moveInDate, setMoveInDate] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const [contactMethod, setContactMethod] = useState<string>("Instagram");
  const [contactValue, setContactValue] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsAuthed(!!data.session));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Title is required.");
      return;
    }
    if (!contactValue.trim()) {
      setErrorMsg("Please add a contact handle/value.");
      return;
    }

    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      setLoading(false);
      setErrorMsg("You must be logged in.");
      return;
    }

    const payload = {
      user_id: user.id,
      post_type: postType,
      title: title.trim(),
      description: description.trim() || null,
      grad_year: gradYear ? Number(gradYear) : null,
      new_to_campus: newToCampus,
      budget_min: budgetMin ? Number(budgetMin) : null,
      budget_max: budgetMax ? Number(budgetMax) : null,
      move_in_date: moveInDate || null,
      location: location.trim() || null,
      contact_method: contactMethod.trim() || null,
      contact_value: contactValue.trim() || null
    };

    const { error } = await supabase.from("housing_posts").insert(payload);

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    router.push("/housing");
  }

  if (!isAuthed) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
        <PrimaryTabs />
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 14 }}>
          <b>You must be logged in to post.</b>
        </div>
      </div>
    );
  }

  const years = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() + i);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <PrimaryTabs />

      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Post in Housing</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 900 }}>Post type</label>
          <select value={postType} onChange={(e) => setPostType(e.target.value as any)} style={{ padding: 10, borderRadius: 10 }}>
            <option value="roommate">Find Roommate</option>
            <option value="sublease">Sublease</option>
          </select>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 900 }}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: 10, borderRadius: 10 }} />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 900 }}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ padding: 10, borderRadius: 10, minHeight: 120 }} />
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 900 }}>Grad year</label>
            <select value={gradYear} onChange={(e) => setGradYear(e.target.value)} style={{ padding: 10, borderRadius: 10 }}>
              <option value="">(optional)</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 28 }}>
            <input type="checkbox" checked={newToCampus} onChange={(e) => setNewToCampus(e.target.checked)} />
            <span style={{ fontWeight: 900 }}>New to campus</span>
          </label>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 900 }}>Budget min</label>
            <input value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} style={{ padding: 10, borderRadius: 10 }} />
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 900 }}>Budget max</label>
            <input value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} style={{ padding: 10, borderRadius: 10 }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 900 }}>Move-in date</label>
            <input type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} style={{ padding: 10, borderRadius: 10 }} />
          </div>
          <div style={{ display: "grid", gap: 6, flex: 1 }}>
            <label style={{ fontWeight: 900 }}>Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} style={{ padding: 10, borderRadius: 10 }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 900 }}>Contact method</label>
            <select value={contactMethod} onChange={(e) => setContactMethod(e.target.value)} style={{ padding: 10, borderRadius: 10 }}>
              <option>Instagram</option>
              <option>Text</option>
              <option>Email</option>
              <option>Snapchat</option>
              <option>Other</option>
            </select>
          </div>
          <div style={{ display: "grid", gap: 6, flex: 1 }}>
            <label style={{ fontWeight: 900 }}>Contact value (handle / # / email)</label>
            <input value={contactValue} onChange={(e) => setContactValue(e.target.value)} style={{ padding: 10, borderRadius: 10 }} />
          </div>
        </div>

        {errorMsg ? (
          <div style={{ padding: 12, borderRadius: 12, background: "#fee2e2", fontWeight: 800 }}>
            {errorMsg}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 12,
            borderRadius: 12,
            background: "#111111",
            color: "#ffffff",
            fontWeight: 900,
            border: "none",
            cursor: "pointer"
          }}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
}
