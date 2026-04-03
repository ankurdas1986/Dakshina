"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { isSupabaseConfigured } from "../../lib/auth";
import { registerPriest } from "../../lib/priest-platform-store";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(formData: FormData, key: string, fallback: number) {
  const value = Number(readText(formData, key));
  return Number.isFinite(value) ? value : fallback;
}

export async function submitPriestRegistration(formData: FormData) {
  const name = readText(formData, "name");
  const email = readText(formData, "email").toLowerCase();
  const phone = readText(formData, "phone");
  const district = readText(formData, "district");
  const locality = readText(formData, "locality");
  const notes = readText(formData, "notes");
  const radiusKm = readNumber(formData, "radiusKm", 10);

  if (!name || !email || !phone || !district || !locality) {
    redirect("/register?error=missing_registration_fields");
  }

  const result = await registerPriest({
    name,
    email,
    phone,
    district,
    locality,
    radiusKm,
    notes
  });

  if (!result.ok) {
    redirect(`/register?error=${result.reason}&email=${encodeURIComponent(email)}`);
  }

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true
      }
    });
  }

  redirect(`/?message=${encodeURIComponent("Registration submitted. Use the OTP to sign in after admin review starts.")}&email=${encodeURIComponent(email)}`);
}
