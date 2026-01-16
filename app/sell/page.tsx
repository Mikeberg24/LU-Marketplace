"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const CATEGORIES = [
  "Textbooks & Academics",
  "Electronics",
  "Furniture",
  "Clothing",
  "Services",
  "Tickets",
  "Other",
];

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];
const LOCATIONS = ["On-campus", "Off-campus", "Meetup", "Online Transfer"];

function isHeicFile(file: File) {
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return (
    type.includes("heic") ||
    type.includes("heif") ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

function isAllowedImage(file: File) {
  const type = (file.type || "").toLowerCase();
  // Some browsers may leave type empty; fall back to extension
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop() || "";

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const allowedExts = ["jpg", "jpeg", "png", "webp"];

  return allowedTypes.includes(type) || allowedExts.includes(ext);
}

export default function SellPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState(CONDITIONS[2]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [courseCode, setCourseCode] = useState("");
  const [description, setDescription] = useState("");

  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;

      if (!uid) {
        router.replace("/login");
        return;
      }

      setUserId(uid);
      setContactEmail(data.user?.email ?? "");
    };

    run();
  }, [router]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);

    const f = e.target.files?.[0] || null;
    if (!f) {
      setImageFile(null);
      return;
    }

    // Block HEIC/HEIF (phone uploads) because desktop browsers often can't render them
    if (isHeicFile(f)) {
      setImageFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setErrorMsg("HEIC photos aren’t supported yet. Please upload a JPG, PNG, or WebP.");
      return;
    }

    if (!isAllowedImage(f)) {
      setImageFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setErrorMsg("Please upload a JPG, PNG, or WebP image.");
      return;
    }

    setImageFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!userId) return;

    const cleanTitle = title.trim();
    if (!cleanTitle) return setErrorMsg("Title is required.");

    const numericPrice = Number(price);
    if (!price || Number.isNaN(numericPrice) || numericPrice <= 0) {
      return setErrorMsg("Please enter a valid price (greater than 0).");
    }

    const cleanEmail = contactEmail.trim();
    if (!cleanEmail) return setErrorMsg("Contact email is required.");

    setSubmitting(true);

    try {
      let image_url: string | null = null;
      let image_path: string | null = null;

      if (imageFile) {
        // Extra safety: prevent HEIC even if a browser bypasses accept filters
        if (isHeicFile(imageFile) || !isAllowedImage(imageFile)) {
          throw new Error("Unsupported image format. Please use JPG, PNG, or WebP.");
        }

        const name = imageFile.name.toLowerCase();
        const ext = name.split(".").pop() || "jpg";
        const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";

        const filePath = `${userId}/${crypto.randomUUID()}.${safeExt}`;

        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: imageFile.type || undefined,
          });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("listing-images")
          .getPublicUrl(filePath);

        image_url = publicData.publicUrl;
        image_path = filePath;
      }

      const { error: insertError } = await supabase.from("listings").insert({
        user_id: userId,
        title: cleanTitle,
        price: numericPrice,
        category,
        condition,
        location,
        course_code: courseCode.trim() || null,
        description: description.trim() || null,
        contact_email: cleanEmail,
        contact_phone: contactPhone.trim() || null,
        image_url,
        image_path,
        views: 0,
      });

      if (insertError) throw insertError;

      // Clear file input so users can re-select the same file next time
      setImageFile(null);
      if (fileRef.current) fileRef.current.value = "";

      router.push("/my-listings");
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="h1">Post a Listing</h1>
          <p className="subtle">Keep it simple. Clear title, fair price, good pickup info.</p>
        </div>

        <button className="btn btnSoft" onClick={() => router.push("/marketplace")}>
          Back to Browse
        </button>
      </div>

      {errorMsg ? (
        <div
          className="card cardPad"
          style={{
            marginTop: 16,
            border: "1px solid rgba(239,68,68,.25)",
            background: "rgba(239,68,68,.08)",
            color: "#7a1f1f",
            fontWeight: 900,
          }}
        >
          {errorMsg}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="card cardPad" style={{ marginTop: 16 }}>
        <div className="gridCards" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <div style={{ fontWeight: 950, marginBottom: 6 }}>Title</div>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <div style={{ fontWeight: 950, marginBottom: 6 }}>Price ($)</div>
            <input
              className="input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              placeholder="e.g., 30"
            />
          </div>

          <div>
            <div style={{ fontWeight: 950, marginBottom: 6 }}>Category</div>
            <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontWeight: 950, marginBottom: 6 }}>Condition</div>
            <select className="select" value={condition} onChange={(e) => setCondition(e.target.value)}>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontWeight: 950, marginBottom: 6 }}>Pickup</div>
            <select className="select" value={location} onChange={(e) => setLocation(e.target.value)}>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontWeight: 950, marginBottom: 6 }}>Course code (optional)</div>
            <input
              className="input"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g., MATH 132"
            />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 950, marginBottom: 6 }}>Description (optional)</div>
          <textarea
            className="textarea"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is it? Any issues? What’s included?"
          />
        </div>

        <div className="hr" />

        <div className="gridCards" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <div style={{ fontWeight: 950, marginBottom: 6 }}>Contact Email</div>
            <input className="input" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>

          <div>
            <div style={{ fontWeight: 950, marginBottom: 6 }}>Phone (optional)</div>
            <input
              className="input"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 950, marginBottom: 6 }}>Photo (optional)</div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onPickFile}
          />
          <div className="subtle" style={{ marginTop: 6 }}>
            Use JPG/PNG/WebP. (HEIC from iPhones isn’t supported on all laptops yet.)
          </div>
        </div>

        <div className="row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
          <button className="btn btnPrimary" type="submit" disabled={submitting}>
            {submitting ? "Posting..." : "Post Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
