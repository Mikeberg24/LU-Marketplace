"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function isHeicLike(file: File) {
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return (
    type.includes("heic") ||
    type.includes("heif") ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

function formatBytes(bytes: number) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function SellPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

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

  const [rawFile, setRawFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null); // may be converted
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [converting, setConverting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auth load
  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;

      if (!u) {
        router.replace("/login");
        return;
      }

      setUserId(u.id);
      setContactEmail(u.email ?? "");
    };

    run();
  }, [router]);

  // Preview cleanup
  useEffect(() => {
    if (!imagePreviewUrl) return;
    return () => URL.revokeObjectURL(imagePreviewUrl);
  }, [imagePreviewUrl]);

  const canSubmit = useMemo(() => {
    if (submitting || converting) return false;
    if (!userId) return false;
    if (!title.trim()) return false;
    const n = Number(price);
    if (!price || Number.isNaN(n) || n <= 0) return false;
    if (!contactEmail.trim()) return false;
    return true;
  }, [submitting, converting, userId, title, price, contactEmail]);

  async function convertHeicToJpeg(file: File): Promise<File> {
    // Dynamic import keeps bundle cleaner + avoids any weird build issues
    const mod = await import("heic2any");
    const heic2any = mod.default;

    const blob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.85,
    });

    const jpegBlob = Array.isArray(blob) ? blob[0] : blob;
    const newName = file.name.replace(/\.(heic|heif)$/i, "") + ".jpg";
    return new File([jpegBlob], newName, { type: "image/jpeg" });
  }

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);

    const f = e.target.files?.[0] || null;

    // Clear input so selecting same file again works
    if (fileRef.current) fileRef.current.value = "";

    if (!f) {
      setRawFile(null);
      setImageFile(null);
      setImagePreviewUrl(null);
      return;
    }

    setRawFile(f);

    // Always show *something* for preview if possible.
    // HEIC preview on some desktops may not render — that's OK; conversion will fix.
    try {
      const preview = URL.createObjectURL(f);
      setImagePreviewUrl(preview);
    } catch {
      setImagePreviewUrl(null);
    }

    // If HEIC/HEIF, convert immediately so storage + rendering is consistent everywhere
    if (isHeicLike(f)) {
      setConverting(true);
      try {
        const converted = await convertHeicToJpeg(f);
        setImageFile(converted);

        // Replace preview with converted version for consistent display
        try {
          const preview2 = URL.createObjectURL(converted);
          setImagePreviewUrl((old) => {
            if (old) URL.revokeObjectURL(old);
            return preview2;
          });
        } catch {
          // ok
        }
      } catch {
        // If conversion fails, still store raw file so you can decide.
        // But we tell the user why it might not show on laptop.
        setImageFile(f);
        setErrorMsg(
          "This photo is HEIC. Conversion failed on this browser. Try a different photo or upload a JPG/PNG."
        );
      } finally {
        setConverting(false);
      }
      return;
    }

    // Non-HEIC
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
        const mime = (imageFile.type || "").toLowerCase();

        // Determine ext/content-type in a way that guarantees laptop rendering
        const ext =
          mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
        const contentType =
          mime === "image/png"
            ? "image/png"
            : mime === "image/webp"
            ? "image/webp"
            : "image/jpeg";

        const filePath = `${userId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType, // ✅ key fix so desktop displays inline
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

      // Reset form bits
      setTitle("");
      setPrice("");
      setCourseCode("");
      setDescription("");
      setContactPhone("");
      setRawFile(null);
      setImageFile(null);
      setImagePreviewUrl(null);

      router.push("/my-listings");
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 className="h1" style={{ marginBottom: 6 }}>Post a Listing</h1>
          <p className="subtle" style={{ marginTop: 0 }}>
            Straightforward details. Real photos. Faster messages.
          </p>
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
        {/* Top row */}
        <div className="gridCards" style={{ gridTemplateColumns: "1.2fr .8fr" }}>
          <div>
            <div style={{ fontWeight: 950, marginBottom: 6 }}>Title</div>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Managerial Accounting textbook"
            />
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
        </div>

        {/* Selects */}
        <div className="gridCards" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 12 }}>
          <div>
            <div style={{ fontWeight: 950, marginBottom: 6 }}>Category</div>
            <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontWeight: 950, marginBottom: 6 }}>Condition</div>
            <select className="select" value={condition} onChange={(e) => setCondition(e.target.value)}>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="gridCards" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 12 }}>
          <div>
            <div style={{ fontWeight: 950, marginBottom: 6 }}>Pickup</div>
            <select className="select" value={location} onChange={(e) => setLocation(e.target.value)}>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontWeight: 950, marginBottom: 6 }}>Course code (optional)</div>
            <input
              className="input"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g., ACCT 212"
            />
          </div>
        </div>

        {/* Description */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 950, marginBottom: 6 }}>Description (optional)</div>
          <textarea
            className="textarea"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What’s included? Any wear? Best pickup times?"
          />
        </div>

        <div className="hr" />

        {/* Contact */}
        <div className="gridCards" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <div style={{ fontWeight: 950, marginBottom: 6 }}>Contact Email</div>
            <input
              className="input"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="you@liberty.edu"
            />
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

        {/* Photo */}
        <div style={{ marginTop: 12 }}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontWeight: 950 }}>Photo (optional)</div>
            <div className="subtle">
              {converting ? "Converting HEIC → JPG…" : rawFile ? `${rawFile.name} · ${formatBytes(rawFile.size)}` : ""}
            </div>
          </div>

          <div style={{ marginTop: 6 }} className="row">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPickFile}
              disabled={submitting}
            />
          </div>

          <div className="subtle" style={{ marginTop: 6 }}>
            iPhone HEIC is supported — we convert it automatically so it shows on laptops.
          </div>

          {imagePreviewUrl ? (
            <div
              className="card"
              style={{
                marginTop: 10,
                border: "1px solid rgba(15,23,42,.10)",
                overflow: "hidden",
                maxWidth: 520,
              }}
            >
              <img
                src={imagePreviewUrl}
                alt="Preview"
                style={{
                  width: "100%",
                  display: "block",
                  maxHeight: 260,
                  objectFit: "cover",
                }}
              />
            </div>
          ) : null}
        </div>

        {/* Submit */}
        <div className="row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
          <button className="btn btnPrimary" type="submit" disabled={!canSubmit}>
            {submitting ? "Posting..." : "Post Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
