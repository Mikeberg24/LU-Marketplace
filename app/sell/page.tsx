"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

export default function SellPage() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Textbooks & Academics");
  const [condition, setCondition] = useState("Good");
  const [location, setLocation] = useState("On-campus");
  const [courseCode, setCourseCode] = useState("");
  const [description, setDescription] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!title.trim()) return setStatusMsg("Please enter a title.");
    const priceNum = Number(price);
    if (!price || Number.isNaN(priceNum) || priceNum < 0)
      return setStatusMsg("Please enter a valid price (0 or more).");

    setSaving(true);

    const { error } = await supabase.from("listings").insert({
      title: title.trim(),
      price: priceNum,
      category,
      condition,
      location,
      course_code: courseCode.trim() || null,
      description: description.trim() || null,
    });

    setSaving(false);

    if (error) return setStatusMsg(error.message);

    setStatusMsg("Listing posted successfully!");
    setTitle("");
    setPrice("");
    setCourseCode("");
    setDescription("");
    setCategory("Textbooks & Academics");
    setCondition("Good");
    setLocation("On-campus");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">Post a Listing</h1>
        <Link
          href="/marketplace"
          className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          Back to Marketplace
        </Link>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Title</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="Calculus 2 textbook"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Price ($)</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="30"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Course code (optional)</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="MATH 132"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Use this for textbooks so buyers can filter by class.
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold">Category</label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Textbooks & Academics</option>
              <option>Graduation</option>
              <option>Events & Tickets</option>
              <option>Campus Life</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold">Condition</label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option>New</option>
              <option>Like new</option>
              <option>Good</option>
              <option>Fair</option>
              <option>Needs work</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Pickup location</label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option>On-campus</option>
              <option>Off-campus</option>
              <option>Meet-up (agreed spot)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Description (optional)</label>
            <textarea
              className="mt-1 w-full rounded-lg border px-3 py-2"
              rows={4}
              placeholder="Edition, notes, what's included, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {statusMsg && (
          <div className="mt-4 rounded-lg border px-4 py-3 text-sm text-gray-700">
            {statusMsg}
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Posting..." : "Create Listing"}
          </button>

          <Link
            href="/marketplace"
            className="rounded-lg border px-5 py-3 text-sm font-semibold hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
