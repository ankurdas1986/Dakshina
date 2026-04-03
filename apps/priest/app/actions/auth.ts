"use server";

import { redirect } from "next/navigation";
import { clearDevSession, getDevFixedOtp, shouldUseDevAuthFallback } from "../../lib/auth";
import { getPriestByEmail } from "../../lib/priest-platform-store";
import { createClient } from "../../lib/supabase/server";

function normalizeEmail(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function requestMagicLink(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const nextValue = formData.get("next");
  const nextPath = typeof nextValue === "string" ? nextValue : "/dashboard";

  if (!email) {
    redirect(`/?error=missing_email`);
  }

  const priest = await getPriestByEmail(email);

  if (!priest) {
    redirect(`/?error=registration_required&email=${encodeURIComponent(email)}`);
  }

  const fixedOtp = getDevFixedOtp();

  if (shouldUseDevAuthFallback()) {
    redirect(
      `/?message=${encodeURIComponent(`Development mode is active. Use OTP ${fixedOtp}.`)}&email=${encodeURIComponent(email)}&next=${encodeURIComponent(nextPath)}`
    );
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(String(nextPath))}`
    }
  });

  if (error) {
    redirect(`/?error=${encodeURIComponent(error.message)}&email=${encodeURIComponent(email)}`);
  }

  redirect(`/?message=${encodeURIComponent("Check your email for the sign-in link or code.")}&email=${encodeURIComponent(email)}`);
}

export async function verifyEmailOtp(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const tokenValue = formData.get("token");
  const token = typeof tokenValue === "string" ? tokenValue.trim() : "";

  if (!email || !token) {
    redirect("/?error=missing_otp_details");
  }

  const priest = await getPriestByEmail(email);

  if (!priest) {
    redirect(`/?error=registration_required&email=${encodeURIComponent(email)}`);
  }

  const fixedOtp = getDevFixedOtp();

  if (shouldUseDevAuthFallback()) {
    if (token !== fixedOtp) {
      redirect(`/?error=invalid_fixed_otp&email=${encodeURIComponent(email)}`);
    }

    const { setDevSession } = await import("../../lib/auth");
    await setDevSession(email);
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email"
  });

  if (error) {
    redirect(`/?error=${encodeURIComponent(error.message)}&email=${encodeURIComponent(email)}`);
  }

  redirect("/dashboard");
}

export async function signOut() {
  await clearDevSession();

  if (shouldUseDevAuthFallback()) {
    redirect("/?message=Signed out");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/?message=Signed out");
}
