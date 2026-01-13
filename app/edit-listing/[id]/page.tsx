"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Listing = {
  id: string;
  user_id: string;
  title: string;
  price: number;
  category: string;
  condition: string | null;
  location: string | null;
  course_code: string | null;
  description: string | null;
  image_url: string | null;
  image_path: string | null;
};

const CATEGORIES = [
  "Textbooks & Academics",
  "Electronics",
  "Furniture",
  "Clothing",
  "Services",
  "tickets",
  "Other",
];

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];
const LOCATIONS = ["On-campus", "Off-campus", "Meetup", "Online Transfer"];

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);

  // form fields
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<string>("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState(CONDITIONS[2]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [courseCode, setCourseCode] = useState("");
  const [description, setDescription] = useState("");

  // photo replacement
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data: authData } = await supabase.auth.getUser();
      const uid = authData.user?.id ?? null;

      if (!uid) {
        router.replace("/login");
        return;
      }
      setUserId(uid);

      const { data, error } = await supabase
        .from("listings")
        .select("id,user_id,title,price,category,condition,location,course_code,description,image_url,image_path")
        .eq("id", id)
        .single();

      if (error || !data) {
        setErrorMsg(error?.message ?? "Listing not found.");
        setLoading(false);
        return;
      }

      const l = data as Listing;

      if (l.user_id !== uid) {
        setErrorMsg("You don’t have permission to edit this listing.");
        setLoading(false);
        return;
      }

      setListing(l);

      setTitle(l.title ?? "");
      setPrice(String(l.price ?? ""));
      setCategory(l.category ?? CATEGORIES[0]);
      setCondition(l.condition ?? CONDITIONS[2]);
      setLocation(l.location ?? LOCATIONS[0]);
      setCourseCode(l.course_code ?? "");
      setDescription(l.description ?? "");

      setLoading(false);
    };

    if (id) run();
  }, [id, router]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!userId || !listing) return;

    const cleanTitle = title.trim();
    if (!cleanTitle) return setErrorMsg("Title is required.");

    const numericPrice = Number(price);
    if (!price || Number.isNaN(numericPrice) || numericPrice <= 0) {
      return setErrorMsg("Please enter a valid price (greater than 0).");
    }

    setSaving(true);

    let image_url = listing.image_url;
    let image_path = listing.image_path;

    // If user selected a new image: delete old (if we have path), upload new, update url/path
    if (newImageFile) {
      // delete old
      if (image_path) {
        const { error: removeErr } = await supabase.storage
          .from("listing-images")
          .remove([image_path]);

        if (removeErr) {
          setSaving(false);
          return setErrorMsg(removeErr.message);
        }
      }

      // upload new
      const ext = (newImageFile.name.split(".").pop() || "jpg").toLowerCase();
      const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
      const newPath = `${userId}/${crypto.randomUUID()}.${safeExt}`;

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(newPath, newImageFile, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setSaving(false);
        return setErrorMsg(uploadError.message);
      }

      const { data: publicData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(newPath);

      image_url = publicData.publicUrl;
      image_path = newPath;
    }

    const { error } = await supabase
      .from("listings")
      .update({
        title: cleanTitle,
        price: numericPrice,
        category,
        condition,
        location,
        course_code: courseCode.trim() || null,
        description: description.trim() || null,
        image_url,
        image_path,
      })
      .eq("id", id);

    if (error) {
      setSaving(false);
      return setErrorMsg(error.message);
    }

    setSaving(false);
    router.push("/my-listings");
    router.refresh?.();
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 18 }}>Loading…</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Edit Listing</h1>
        <button
          onClick={() => router.push("/my-listings")}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "white", cursor: "pointer" }}
        >
          Back
        </button>
      </div>

      {errorMsg && (
        <div style={{ marginTop: 12, border: "1px solid #f1b3b3", background: "#fff5f5", borderRadius: 14, padding: 14, color: "#7a1f1f" }}>
          {errorMsg}
        </div>
      )}

      {/* Current photo */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Current photo</div>
        {listing?.image_url ? (
          <img
            src={listing.image_url}
            alt="Current listing photo"
            style={{ width: "100%", height: 240, objectFit: "cover", borderRadius: 14, background: "#f3f3f3" }}
          />
        ) : (
          <div style={{ width: "100%", height: 240, borderRadius: 14, background: "#f3f3f3", display: "flex", alignItems: "center", justifyContent: "center", color: "#666", fontWeight: 800 }}>
            No photo
          </div>
        )}
      </div>

      <form onSubmit={onSave} style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 800 }}>Replace photo (optional)</span>
          <input type="file" accept="image/*" onChange={(e) => setNewImageFile(e.target.files?.[0] ?? null)} />
          <div style={{ color: "#666", fontSize: 13 }}>If you choose a new photo, the old one will be deleted.</div>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 800 }}>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 800 }}>Price ($)</span>
          <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", width: 180 }} />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 800 }}>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "white" }}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 800 }}>Condition</span>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "white" }}>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 800 }}>Pickup</span>
          <select value={location} onChange={(e) => setLocation(e.target.value)} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "white", width: 220 }}>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 800 }}>Course code (optional)</span>
          <input value={courseCode} onChange={(e) => setCourseCode(e.target.value)} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", width: 220 }} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 800 }}>Description (optional)</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", resize: "vertical" }} />
        </label>

        <button type="submit" disabled={saving} style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #111", background: saving ? "#444" : "#111", color: "white", cursor: saving ? "not-allowed" : "pointer", fontWeight: 900 }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
