"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";


export default function Header() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/marketplace");
    router.refresh?.();
  };

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ background: "rgba(246,247,251,0.85)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(15,23,42,.10)" }}>
        <div className="container" style={{ paddingTop: 14, paddingBottom: 14 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <Link href="/marketplace" style={{ textDecoration: "none", fontWeight: 950, letterSpacing: "-0.02em" }}>
              Liberty Marketplace
            </Link>

            <div className="row">
              <Link className="btn" href="/marketplace">Browse</Link>
              <Link className="btn" href="/my-listings">My Listings</Link>
              <Link className="btn btnPrimary" href="/sell">Post</Link>

              {userEmail ? (
                <button className="btn btnSoft" onClick={signOut} title={userEmail}>
                  Sign out
                </button>
              ) : (
                <Link className="btn btnSoft" href="/login">Sign in</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
