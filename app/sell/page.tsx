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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUserId(data.user.id);
      setContactEmail(data.user.email ?? "");
    });
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0] || null;
    if (!file) return;

    setImageFile(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!userId) return;

    if (!title.trim()) return setErrorMsg("Title is required.");
    const numericPrice = Number(price);
    if (!numericPrice || numericPrice <= 0)
      return setErrorMsg("Enter a valid price.");

    if (!contactEmail.trim())
      return setErrorMsg("Contact email is required.");

    setSubmitting(true);

    try {
      let image_url: string | null = null;
      let image_path: string | null = null;

      if (imageFile) {
        const ext =
          imageFile.type === "image/png"
            ? "png"
            : imageFile.type === "image/webp"
            ? "webp"
            : "jpg";

        const filePath = `${userId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: imageFile.type || "image/jpeg",
          });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("listing-images")
          .getPublicUrl(filePath);

        image_url = publicData.publicUrl;
        image_path = filePath;
      }

      const { error } = await supabase.from("listings").insert({
        user_id: userId,
        title: title.trim(),
        price: numericPrice,
        category,
        condition,
        location,
        course_code: courseCode.trim() || null,
        description: description.trim() || null,
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim() || null,
        image_url,
        image_path,
        views: 0,
      });

      if (error) throw error;

      router.push("/my-listings");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h1 className="h1">Post a Listing</h1>
      <p className="subtle">Clear info sells faster.</p>

      {errorMsg && (
        <div className="card cardPad" style={{ marginTop: 12, color: "#7a1f1f" }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card cardPad" style={{ marginTop: 16 }}>
        <div className="gridCards" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="input" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>

        <div className="gridCards" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 12 }}>
          <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="select" value={condition} onChange={(e) => setCondition(e.target.value)}>
            {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          <textarea
            className="textarea"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="gridCards" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 12 }}>
          <input className="input" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          <input className="input" placeholder="Phone (optional)" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </div>

        <div style={{ marginTop: 12 }}>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} />
          <div className="subtle">Photos help your listing stand out.</div>
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
