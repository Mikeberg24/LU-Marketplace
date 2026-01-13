"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORIES, FulfillmentMethod } from "@/lib/constants";



export default function NewListingPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [category, setCategory] = useState("other");
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<FulfillmentMethod>("pickup");

  const [pickupLocation, setPickupLocation] = useState("");
  const [transferDetails, setTransferDetails] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title || !description || !price) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in.");
      }

      const { error: insertError } = await supabase
        .from("listings")
        .insert([
          {
            title,
            description,
            price: Number(price),
            category,
            fulfillment_method: fulfillmentMethod,
            pickup_location:
              fulfillmentMethod === "pickup" ? pickupLocation || null : null,
            transfer_details:
              fulfillmentMethod === "online_transfer"
                ? transferDetails || null
                : null,
            user_id: user.id,
          },
        ]);

      if (insertError) throw insertError;

      router.push("/marketplace");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Create Listing</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        {error && (
          <div style={{ background: "#fee2e2", padding: 10, borderRadius: 6 }}>
            {error}
          </div>
        )}

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === "ticket"
                ? "Ticket"
                : c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={fulfillmentMethod}
          onChange={(e) =>
            setFulfillmentMethod(e.target.value as FulfillmentMethod)
          }
        >
          <option value="pickup">Pickup</option>
          <option value="online_transfer">Online transfer</option>
        </select>

        {fulfillmentMethod === "pickup" ? (
          <input
            placeholder="Pickup location (optional)"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
          />
        ) : (
          <input
            placeholder="Transfer details (optional)"
            value={transferDetails}
            onChange={(e) => setTransferDetails(e.target.value)}
          />
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Listing"}
        </button>
      </form>
    </div>
  );
}
