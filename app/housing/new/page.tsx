"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PrimaryTabs from "@/components/PrimaryTabs";
import { supabase } from "@/lib/supabaseClient";

type UploadResult = {
  image_url: string;
  image_path: string;
};

async function uploadHousingImage(file: File, userId: string): Promise<UploadResult> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const safeExt = ext.replace(/[^a-z0-9]/g, "") || "jpg";
  const image_path = `${userId}/${Date.now()}.${safeExt}`;

  const { error: uploadErr } = await supabase.storage
    .from("housing-images")
    .upload(image_path, file, {
      upsert: true,
      contentType: file.type || "image/jpeg",
    });

  if (uploadErr) throw uploadErr;

  const { data } = supabase.storage.from("housing-images").getPublicUrl(image_path);
  const image_url = data.publicUrl;

  return { image_url, image_path };
}

export default function HousingNewPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // rent per month
  const [price, setPrice] = useState("");

  const [location, setLocation] = useState("");
  const [housingType, setHousingType] = useState("Apartment");
  const [leaseType, setLeaseType] = useState("Sublease");
  const [availableFrom, setAvailableFrom] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const t = title.trim();
    const d = description.trim();
    const rentStr = price.trim();
    const rentNum = rentStr ? Number(rentStr) : NaN;

    if (!t) return setErr("Please add a title.");
    if (!rentStr || Number.isNaN(rentNum)) return setErr("Please enter a valid rent amount.");

    setLoading(true);

    try {
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();

      if (authErr) throw authErr;
      if (!user) throw new Error("You must be signed in to post housing.");

      // Upload image (optional)
      let image_url: string | null = null;
      let image_path: string | null = null;

      if (imageFile) {
        const up = await uploadHousingImage(imageFile, user.id);
        image_url = up.image_url;
        image_path = up.image_path;
      }

      // IMPORTANT:
      // - user_id must be included (RLS insert policy checks it)
      // - post_type must be set so the Housing page can filter correctly
      const { error: insertErr } = await supabase.from("housing_posts").insert({
        user_id: user.id,
        post_type: "sublease",

        title: t,
        description: d || null,
        price: rentNum,

        location: location.trim() || null,
        housing_type: housingType,
        lease_type: leaseType,
        available_from: availableFrom.trim() || null,

        image_url,
        image_path,
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
          <h1 className="h1">Post Housing</h1>
          <p className="subtle">Add a sublease listing for Liberty students.</p>
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
            placeholder="Ex: Sublease at Cornerstone — 2 bed / 2 bath"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label className="label">Description</label>
          <textarea
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Bedrooms/bathrooms, utilities, parking, roommates, rules, etc."
            style={{ minHeight: 110 }}
          />
        </div>

        <div className="grid3" style={{ marginBottom: 12 }}>
          <div>
            <label className="label">Rent (per month)</label>
            <input
              className="input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex: 650"
              inputMode="numeric"
            />
          </div>

          <div>
            <label className="label">Housing Type</label>
            <select className="select" value={housingType} onChange={(e) => setHousingType(e.target.value)}>
              <option>Apartment</option>
              <option>House</option>
              <option>Townhome</option>
              <option>Dorm / Room</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="label">Lease Type</label>
            <select className="select" value={leaseType} onChange={(e) => setLeaseType(e.target.value)}>
              <option>Sublease</option>
              <option>Lease takeover</option>
              <option>Room available</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="grid3" style={{ marginBottom: 12 }}>
          <div style={{ gridColumn: "span 2" as any }}>
            <label className="label">Location</label>
            <input
              className="input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: On-campus / The Vue / Cornerstone / Wards Rd"
            />
          </div>

          <div>
            <label className="label">Available From (optional)</label>
            <input
              className="input"
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
              placeholder="Ex: Feb 1"
            />
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
            Exterior or living room photos work best.
          </div>

          {previewUrl ? (
            <div style={{ marginTop: 12, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(15,23,42,.10)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview"
                style={{ width: "100%", maxHeight: 320, objectFit: "cover", display: "block" }}
              />
            </div>
          ) : null}
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
            {loading ? "Posting..." : "Post Housing"}
          </button>
        </div>
      </form>
    </div>
  );
}
