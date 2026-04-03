import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { getPriestByEmail } from "./priest-platform-store";

const DEV_SESSION_COOKIE = "dakshina_priest_dev_session";

type PriestSession = {
  email?: string;
  role?: string;
};

function parseSession(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as PriestSession;
  } catch {
    return null;
  }
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function getDevFixedOtp() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return process.env.DEV_FIXED_OTP?.trim() || "246810";
}

export function shouldUseDevAuthFallback() {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  return !isSupabaseConfigured() || Boolean(getDevFixedOtp());
}

export async function setDevSession(email: string) {
  const cookieStore = await cookies();
  cookieStore.set(DEV_SESSION_COOKIE, JSON.stringify({ email: email.toLowerCase(), role: "priest" }), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24
  });
}

export async function clearDevSession() {
  const cookieStore = await cookies();
  cookieStore.delete(DEV_SESSION_COOKIE);
}

export async function requirePriestUser() {
  const cookieStore = await cookies();
  const devSession = parseSession(cookieStore.get(DEV_SESSION_COOKIE)?.value);

  if (devSession?.email) {
    const priest = await getPriestByEmail(devSession.email);

    if (priest) {
      return priest;
    }

    cookieStore.delete(DEV_SESSION_COOKIE);
  }

  if (!isSupabaseConfigured()) {
    redirect("/?error=priest_login_required");
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/?error=priest_login_required");
  }

  const priest = await getPriestByEmail(user.email);

  if (!priest) {
    redirect("/?error=registration_required");
  }

  return priest;
}
