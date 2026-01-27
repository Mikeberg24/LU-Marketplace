"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const KEY = "lu_logged_in_email";

export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const login = () => {
    setError(null);

    const e = email.trim().toLowerCase();

    if (!e.endsWith("@liberty.edu")) {
      setError("Use your Liberty email (@liberty.edu).");
      return;
    }

    // "Fake login" — no Supabase, no email, no password
    localStorage.setItem(KEY, e);

    router.push("/marketplace");
  };

  return (
    <div>
      <h1>Login</h1>

      <input
        placeholder="you@liberty.edu"
        value={email}
        onChange={(ev) => setEmail(ev.target.value)}
      />

      <button onClick={login}>Login</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
