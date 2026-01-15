"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  condition: string | null;
  location: string | null;
  course_code: string | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
};

function formatDate(dt: string) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [meId, setMeId] = useState<string | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setMeId(data.user?.id ?? null);
    });
  }, []);

  // load listing + seller (NO JOIN)
  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      setErr(null);

      // 1️⃣ fetch listing
      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select(
          "id,title,description,price,category,condition,location,course_code,image_url,created_at,user_id"
        )
        .eq("id", id)
        .single();

      if (listingError || !listingData) {
        setErr(listingError?.message ?? "Listing not found");
        setLoading(false);
        return;
      }

      setListing(listingData);

      // 2️⃣ fetch seller profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id,full_name,email,phone")
        .eq("id", listingData.user_id)
        .single();

      setSeller(profileData ?? null);
      setLoading(false);
    })();
  }, [id]);

  const isMine = useMemo(() => {
    return Boolean(listing && meId && listing.user_id === meId);
  }, [listing, meId]);

  const message = useMemo(() => {
    if (!listing) return "";
    return `Hi! I’m interested in your listing "${listing.title}". Is it still available?`;
  }, [listing]);

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
          <div style={{ fontWeight: 900, fontSize: 18 }}>Couldn’t load listing</div>
          <div className="subtle">{err}</div>
          <div className="row" style={{ marginTop: 12, gap: 12 }}>
            <button className="btn btnSoft" onClick={() => router.back()}>
              Go back
            </button>
            <Link className="btn btnPrimary" href="/marketplace">
              Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="row" style={{ justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 className="h1">{listing.title}</h1>
          <div className="subtle">
            {listing.category}
            {listing.course_code ? ` • ${listing.course_code}` : ""}
          </div>
          <div className="subtle">Posted {formatDate(listing.created_at)}</div>
        </div>
        <div style={{ fontWeight: 950, fontSize: 24 }}>
          ${Number(listing.price).toFixed(0)}
        </div>
      </div>

      {/* Card */}
      <div className="card" style={{ marginTop: 16 }}>
        {listing.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.image_url}
            alt={listing.title}
            style={{ width: "100%", maxHeight: 380, objectFit: "cover" }}
          />
        ) : null}

        <div className="cardPad">
          <div style={{ fontWeight: 850 }}>
            {listing.description || "No description provided."}
          </div>

          <div className="row" style={{ marginTop: 12, gap: 10 }}>
            {listing.condition && (
              <span className="badge">Condition: {listing.condition}</span>
            )}
            {listing.location && (
              <span className="badge">Pickup: {listing.location}</span>
            )}
          </div>

          {/* CONTACT */}
          <div className="card cardPad" style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 900 }}>Contact Seller</div>
            <div className="subtle">
              Seller: {seller?.full_name ?? "Unknown"}
            </div>

            {isMine ? (
              <div className="subtle" style={{ marginTop: 8 }}>
                This is your listing.
              </div>
            ) : (
              <div className="row" style={{ marginTop: 12, gap: 12 }}>
                {seller?.email && (
                  <a
                    className="btn btnPrimary"
                    href={`mailto:${seller.email}?subject=${encodeURIComponent(
                      listing.title
                    )}&body=${encodeURIComponent(message)}`}
                  >
                    Email seller
                  </a>
                )}

                {seller?.phone && (
                  <a className="btn btnSoft" href={`sms:${seller.phone}`}>
                    Text seller
                  </a>
                )}

                <button
                  className="btn btnSoft"
                  onClick={() => navigator.clipboard.writeText(message)}
                >
                  Copy message
                </button>
              </div>
            )}
          </div>

          <div className="row" style={{ marginTop: 16, gap: 12 }}>
            <button className="btn btnSoft" onClick={() => router.back()}>
              Back
            </button>
            <Link className="btn btnSoft" href="/marketplace">
              Browse
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
