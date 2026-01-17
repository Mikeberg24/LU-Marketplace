import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type"); // "magiclink" | "signup" | "recovery" | etc.

  // If you don't have a service role key, this still works for verifying the user,
  // but cannot set a cookie session automatically. We'll pass tokens via URL.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Try both flows:
  if (code) {
    // exchangeCodeForSession is not available in supabase-js directly in a route without helpers.
    // Instead, redirect to a client page that can complete the session.
    return NextResponse.redirect(new URL(`/auth/callback/client?code=${encodeURIComponent(code)}`, url.origin));
  }

  if (token_hash && type) {
    // Verify the OTP and then redirect to client page to set session in browser
    return NextResponse.redirect(
      new URL(
        `/auth/callback/client?token_hash=${encodeURIComponent(token_hash)}&type=${encodeURIComponent(type)}`,
        url.origin
      )
    );
  }

  // fallback
  return NextResponse.redirect(new URL("/login", url.origin));
}
