"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  created_at: string;
};

function formatPrice(price: number) {
  return `$${price.toFixed(0)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [courseFilter, setCourseFilter] = useState("");

  const loadListings = async () => {
    setLoading(true);
    setErr(null);

    const { data, error } = await supabase
      .from("listings")
      .select(
        "id,title,price,category,condition,location,description,course_code,created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setListings([]);
    } else {
      setListings((data as Listing[]) ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cf = courseFilter.trim().toLowerCase();

    return listings.filter((l) => {
      const matchesQuery =
        !q ||
        l.title.toLowerCase().includes(q) ||
        (l.description ?? "").toLowerCase().includes(q);

      const matchesCategory = category === "All" || l.category === category;

      const matchesCourse =
        !cf || (l.course_code ?? "").toLowerCase().includes(cf);

      return matchesQuery && matchesCategory && matchesCourse;
    });
  }, [listings, query, category, courseFilter]);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Marketplace</h1>
          <p className="mt-1 text-sm text-gray-600">
            Browse listings from verified Liberty students.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadListings}
            type="button"
            className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            Refresh
          </button>

          <Link
            href="/sell"
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            Post a Listing
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm font-semibold">Search</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="e.g., calculus, iClicker, gown…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Category</label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>All</option>
              <option>Textbooks & Academics</option>
              <option>Graduation</option>
              <option>Events & Tickets</option>
              <option>Campus Life</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold">Course code (optional)</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="e.g., MATH 132"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="rounded-2xl border bg-white p-6 text-gray-600 shadow-sm">
          Loading listings…
        </div>
      )}

      {!loading && err && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="font-semibold">Couldn’t load listings</p>
          <p className="mt-1 text-sm text-gray-700">{err}</p>
          <button
            onClick={loadListings}
            className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
            type="button"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !err && filtered.length === 0 && (
        <div className="rounded-2xl border bg-white p-10 text-center text-gray-700 shadow-sm">
          <p className="text-lg font-semibold">No listings yet</p>
          <p className="mt-2 text-sm text-gray-600">
            Be the first to post something.
          </p>
          <Link
            href="/sell"
            className="mt-5 inline-block rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white"
          >
            Post a Listing
          </Link>
        </div>
      )}

      {/* Cards */}
      {!loading && !err && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <Link
              key={l.id}
              href={`/listing/${l.id}`}
              className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-extrabold">{l.title}</h2>
                  <div className="mt-1 text-sm text-gray-600">
                    {l.category}
                    {l.course_code ? ` • ${l.course_code}` : ""}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-extrabold">
                    {formatPrice(l.price)}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {formatDate(l.created_at)}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {l.condition && (
                  <span className="rounded-full border px-3 py-1">
                    Condition: {l.condition}
                  </span>
                )}
                {l.location && (
                  <span className="rounded-full border px-3 py-1">
                    Pickup: {l.location}
                  </span>
                )}
              </div>

              {l.description && (
                <p className="mt-4 line-clamp-2 text-sm text-gray-700">
                  {l.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
