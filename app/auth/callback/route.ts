import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type"); // "magiclink" | "signup" | "recovery" | etc.

  const next = url.searchParams.get("next") ?? "/marketplace";
  const safeNext = next.startsWith("/") ? next : "/marketplace";

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  // ✅ PKCE / OAuth-style link
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // ✅ token_hash-style link (your custom template uses this)
  if (token_hash && type) {
    await supabase.auth.verifyOtp({ token_hash, type: type as any });
  }

  return NextResponse.redirect(new URL(safeNext, url.origin));
}
