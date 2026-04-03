import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { getSupabaseEnv } from "../../../lib/supabase/env";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const env = getSupabaseEnv();
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (!env.isConfigured) {
    return NextResponse.redirect(new URL("/sign-in?error=supabase_not_configured", request.url));
  }

  if (!tokenHash) {
    return NextResponse.redirect(new URL("/sign-in?error=missing_token_hash", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "email"
  });

  if (error) {
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}
