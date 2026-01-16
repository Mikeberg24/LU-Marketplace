"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

async function uploadHousingImage(file: File, userId: string) {
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("housing-images")
    .upload(fileName, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("housing-images").getPublicUrl(fileName);
  return data.publicUrl;
}

type HousingPost = {
  id: string;
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

export default function HousingEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [post, setPost] = useState<HousingPost | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");
  const [budget, setBudget] = useState("");
  const [rent, setRent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr(null);

      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) {
        setErr("You must be signed in.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("housing_posts")
        .select("id,user_id,post_type,title,description,location,contact,image_url,budget,rent")
        .eq("id", id)
        .single();

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      // extra safety (RLS should already protect this)
      if (data.user_id !== user.id) {
        setErr("You can only edit your own posts.");
        setLoading(false);
        return;
      }

      const p = data as HousingPost;
      setPost(p);

      setTitle(p.title ?? "");
      setDescription(p.description ?? "");
      setLocation(p.location ?? "");
      setContact(p.contact ?? "");
      setBudget(p.budget == null ? "" : String(p.budget));
      setRent(p.rent == null ? "" : String(p.rent));

      setLoading(false);
    };

    if (id) load();
  }, [id]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!post) return;

    if (!title.trim()) return setErr("Title is required.");
    if (!description.trim()) return setErr("Description is required.");

    setSaving(true);

    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      const user = authData.user;
      if (!user) throw new Error("Not signed in.");

      let nextImageUrl: string | null = post.image_url ?? null;

      if (removePhoto) nextImageUrl = null;

      if (imageFile) {
        nextImageUrl = await uploadHousingImage(imageFile, user.id);
      }

      const payload: any = {
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        contact: contact.trim() || null,
        image_url: nextImageUrl,
        budget: budget.trim() ? Number(budget) : null,
        rent: rent.trim() ? Number(rent) : null,
      };

      const { error } = await supabase.from("housing_posts").update(payload).eq("id", post.id);
      if (error) throw error;

      router.push("/my-listings");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong.");
      setSaving(false);
    }
  };

  return (
    <div className="container">
      

      <div className="row" style={{ justifyContent: "space-between", gap: 16, marginTop: 16 }}>
        <div>
          <h1 className="h1">Edit Housing Post</h1>
          <p className="subtle">Update your roommate/sublease listing.</p>
        </div>

        <Link className="btn btnSoft" href="/my-listings">
          Back to My Listings
        </Link>
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

      {loading ? (
        <div className="card cardPad" style={{ marginTop: 16 }}>
          Loading…
        </div>
      ) : !post ? (
        <div className="card cardPad" style={{ marginTop: 16 }}>
          Post not found.
        </div>
      ) : (
        <form onSubmit={onSave} className="card cardPad" style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="label">Description</label>
            <textarea
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ minHeight: 130 }}
            />
          </div>

          <div className="grid3" style={{ marginBottom: 12 }}>
            <div>
              <label className="label">Budget (optional)</label>
              <input className="input" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
            <div>
              <label className="label">Rent (optional)</label>
              <input className="input" value={rent} onChange={(e) => setRent(e.target.value)} />
            </div>
            <div>
              <label className="label">Location (optional)</label>
              <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="label">Contact (optional)</label>
            <input className="input" value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="label">Photo</label>

            {post.image_url ? (
              <div style={{ marginTop: 8 }}>
                <img
                  src={post.image_url}
                  alt="Current housing photo"
                  style={{ width: 180, height: 180, objectFit: "cover", borderRadius: 16, border: "1px solid rgba(15,23,42,.12)" }}
                />
                <div className="row" style={{ gap: 10, marginTop: 10 }}>
                  <label className="row" style={{ gap: 8, cursor: "pointer", fontWeight: 800 }}>
                    <input type="checkbox" checked={removePhoto} onChange={(e) => setRemovePhoto(e.target.checked)} />
                    Remove current photo
                  </label>
                </div>
              </div>
            ) : (
              <div className="subtle" style={{ marginTop: 6 }}>
                No photo attached.
              </div>
            )}

            <div style={{ marginTop: 10 }}>
              <input className="input" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
              <div className="subtle" style={{ marginTop: 6 }}>
                Uploading a new photo will replace the old one.
              </div>
            </div>
          </div>

          <div className="row" style={{ justifyContent: "flex-end", gap: 12, marginTop: 14 }}>
            <Link className="btn btnSoft" href="/my-listings">
              Cancel
            </Link>
            <button className="btn btnPrimary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
