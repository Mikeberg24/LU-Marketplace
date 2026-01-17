import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";


export async function GET(request: Request) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/marketplace";

  if (code) {
    const supabase = createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const safeNext = next.startsWith("/") ? next : "/marketplace";
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
