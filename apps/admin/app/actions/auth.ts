"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import {
  clearDevSession,
  getDevFixedOtp,
  setDevSession,
  useDevAuthFallback
} from "../../lib/auth";

function normalizeEmail(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function requestMagicLink(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const nextPath = typeof formData.get("next") === "string" ? formData.get("next") : "/dashboard";
  const fixedOtp = getDevFixedOtp();

  if (!email) {
    redirect(`/sign-in?error=missing_email`);
  }

  if (useDevAuthFallback()) {
    redirect(
      `/sign-in?message=${encodeURIComponent(`Development mode is active. Use OTP ${fixedOtp}.`)}&email=${encodeURIComponent(email)}&next=${encodeURIComponent(nextPath)}`
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
    redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/sign-in?message=${encodeURIComponent("Check your email for the sign-in link or code.")}&email=${encodeURIComponent(email)}`);
}

export async function verifyEmailOtp(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const token = typeof formData.get("token") === "string" ? formData.get("token").trim() : "";
  const fixedOtp = getDevFixedOtp();
  const devFallback = useDevAuthFallback();

  if (!email || !token) {
    redirect("/sign-in?error=missing_otp_details");
  }

  if (devFallback) {
    if (token !== fixedOtp) {
      redirect(`/sign-in?error=invalid_fixed_otp&email=${encodeURIComponent(email)}`);
    }

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
    redirect(`/sign-in?error=${encodeURIComponent(error.message)}&email=${encodeURIComponent(email)}`);
  }

  redirect("/dashboard");
}

export async function signOut() {
  await clearDevSession();

  if (useDevAuthFallback()) {
    redirect("/sign-in?message=Signed out");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in?message=Signed out");
}
