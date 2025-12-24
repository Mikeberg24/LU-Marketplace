"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string | null;
  location: string | null;
  description: string | null;
  course_code: string | null;
  contact: string | null;
  created_at: string;
};

function formatPrice(price: number) {
  return `$${price.toFixed(0)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

function isUuid(value: string) {
  // basic UUID v4-ish check (good enough for guarding)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

export default function ListingDetailPage() {
  const params = useParams<{ id?: string }>();
  const id = useMemo(() => {
    const raw = params?.id;
    // Next can give string | string[] depending on route
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr(null);
      setListing(null);

      if (!id || !isUuid(id)) {
        setLoading(false);
        setErr("Invalid listing link (missing or bad id).");
        return;
      }

      const { data, error } = await supabase
        .from("listings")
        .select(
          "id,title,price,category,condition,location,description,course_code,contact,created_at"
        )
        .eq("id", id)
        .single();

      if (error) {
        setErr(error.message);
        setListing(null);
      } else {
        setListing(data as Listing);
      }

      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="rounded-2xl border bg-white p-6 shadow-sm text-gray-600">
          Loading listing…
        </div>
      </main>
    );
  }

  if (err) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="mb-4">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            ← Back to Marketplace
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="font-semibold">Couldn’t load listing</p>
          <p className="mt-1 text-sm text-gray-700">{err}</p>
        </div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          ← Back to Marketplace
        </Link>

        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          Listing not found.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          ← Back to Marketplace
        </Link>

        <Link
          href="/sell"
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          Post another listing
        </Link>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold">{listing.title}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {listing.category}
              {listing.course_code ? ` • ${listing.course_code}` : ""}
            </p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-extrabold">
              {formatPrice(listing.price)}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {formatDate(listing.created_at)}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border p-4">
            <div className="text-xs font-semibold text-gray-500">Condition</div>
            <div className="mt-1 font-semibold">
              {listing.condition ?? "Not specified"}
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="text-xs font-semibold text-gray-500">Pickup</div>
            <div className="mt-1 font-semibold">
              {listing.location ?? "Not specified"}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm font-semibold">Description</div>
          <p className="mt-2 text-gray-700">
            {listing.description?.trim() ? listing.description : "No description."}
          </p>
        </div>

        <div className="mt-6 rounded-xl border p-4">
          <div className="text-xs font-semibold text-gray-500">Contact</div>
          <div className="mt-1 text-sm text-gray-800">
            {listing.contact?.trim()
              ? listing.contact
              : "Not provided yet (we’ll add this soon)."}
          </div>
        </div>
      </div>
    </main>
  );
}
