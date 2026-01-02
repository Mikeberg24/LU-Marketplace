"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

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
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  views: number | null;
};

function formatDate(dt: string) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErr(null);

      const { data: auth } = await supabase.auth.getUser();
      setViewerId(auth.user?.id ?? null);

      const { data, error } = await supabase
        .from("listings")
        .select(
          "id,user_id,title,price,category,condition,location,course_code,description,image_url,contact_email,contact_phone,created_at,views"
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        setErr(error?.message ?? "Listing not found.");
        setListing(null);
        setLoading(false);
        return;
      }

      setListing(data as Listing);
      setLoading(false);

      // Increment views (non-blocking)
      try {
        await supabase
          .from("listings")
          .update({ views: ((data as Listing).views ?? 0) + 1 })
          .eq("id", id);
      } catch {}
    };

    if (id) run();
  }, [id]);

  if (loading) {
    return (
      <div className="container">
        <div className="card cardPad">Loading…</div>
      </div>
    );
  }

  if (err || !listing) {
    return (
      <div className="container">
        <div className="card cardPad">
          <div style={{ fontWeight: 950, fontSize: 20 }}>Listing not found</div>
          <p className="subtle" style={{ marginBottom: 12 }}>
            {err ?? "That listing may have been removed."}
          </p>
          <Link className="btn btnPrimary" href="/marketplace">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = viewerId && viewerId === listing.user_id;

  const email = (listing.contact_email ?? "").trim();
  const phone = (listing.contact_phone ?? "").trim();
  const hasEmail = Boolean(email);
  const hasPhone = Boolean(phone);

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <Link className="btn" href="/marketplace">
          ← Back
        </Link>

        <div className="row">
          {isOwner ? (
            <Link className="btn btnSoft" href={`/edit-listing/${listing.id}`}>
              Edit
            </Link>
          ) : null}
          <span className="badge">Posted: {formatDate(listing.created_at)}</span>
          <span className="badge">Views: {listing.views ?? 0}</span>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14, overflow: "hidden" }}>
        {/* Image header */}
        <div
          style={{
            height: 320,
            background:
              "linear-gradient(135deg, rgba(2,6,23,.06), rgba(2,6,23,.02))",
            borderBottom: "1px solid rgba(15,23,42,.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {listing.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.image_url}
              alt={listing.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ color: "rgba(91,101,119,.9)", fontWeight: 950 }}>
              No photo
            </div>
          )}

          <div
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "rgba(255,255,255,.95)",
              border: "1px solid rgba(15,23,42,.10)",
              borderRadius: 999,
              padding: "8px 12px",
              fontWeight: 950,
              boxShadow: "0 6px 18px rgba(2,6,23,.08)",
              fontSize: 18,
            }}
          >
            ${Number(listing.price).toFixed(0)}
          </div>
        </div>

        {/* Body */}
        <div className="cardPad">
          <div style={{ fontSize: 34, fontWeight: 950, letterSpacing: "-0.02em" }}>
            {listing.title}
          </div>

          <div className="subtle" style={{ fontWeight: 800 }}>
            {listing.category}
            {listing.course_code ? ` • ${listing.course_code}` : ""}
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            {listing.condition ? (
              <span className="badge">Condition: {listing.condition}</span>
            ) : null}
            {listing.location ? (
              <span className="badge">Pickup: {listing.location}</span>
            ) : null}
          </div>

          {listing.description ? (
            <>
              <div className="hr" />
              <div style={{ fontWeight: 950, marginBottom: 6 }}>Description</div>
              <div style={{ color: "rgba(91,101,119,.98)", fontWeight: 750, lineHeight: 1.6 }}>
                {listing.description}
              </div>
            </>
          ) : null}

          <div className="hr" />

          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 950 }}>Contact seller</div>
              <div className="subtle" style={{ marginTop: 4 }}>
                Use email or phone to reach them.
              </div>
            </div>

            <div className="row">
              {hasEmail ? (
                <a className="btn btnPrimary" href={`mailto:${email}`}>
                  Email
                </a>
              ) : (
                <button className="btn" disabled style={{ cursor: "not-allowed", opacity: 0.6 }}>
                  Email
                </button>
              )}

              {hasPhone ? (
                <a className="btn" href={`tel:${phone}`}>
                  Text/Call
                </a>
              ) : (
                <button className="btn" disabled style={{ cursor: "not-allowed", opacity: 0.6 }}>
                  Text/Call
                </button>
              )}
            </div>
          </div>

          <div style={{ marginTop: 10, color: "rgba(91,101,119,.9)", fontWeight: 800, fontSize: 13 }}>
            {hasEmail ? `Email: ${email}` : "Email not provided"}{" "}
            •{" "}
            {hasPhone ? `Phone: ${phone}` : "Phone not provided"}
          </div>
        </div>
      </div>
    </div>
  );
}
