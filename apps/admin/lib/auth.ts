import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

const DEV_SESSION_COOKIE = "dakshina_dev_session";

function getDevAdminAllowlist() {
  const value = process.env.DEV_ADMIN_EMAILS ?? "";

  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function isDevAdminEmail(email?: string | null) {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  if (!email) {
    return false;
  }

  return getDevAdminAllowlist().includes(email.toLowerCase());
}

export async function requireUser() {
  if (process.env.NODE_ENV !== "production") {
    const cookieStore = await cookies();
    const devSession = cookieStore.get(DEV_SESSION_COOKIE)?.value;

    if (devSession) {
      try {
        const parsed = JSON.parse(devSession) as { email?: string; role?: string };

        if (parsed.email) {
          return {
            email: parsed.email,
            app_metadata: { role: parsed.role ?? "admin" },
            user_metadata: { role: parsed.role ?? "admin" }
          } as const;
        }
      } catch {
        cookieStore.delete(DEV_SESSION_COOKIE);
      }
    }
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export function isAdminUser(user: { email?: string | null; app_metadata?: { role?: string }; user_metadata?: { role?: string } }) {
  return (
    user.app_metadata?.role === "admin" ||
    user.user_metadata?.role === "admin" ||
    isDevAdminEmail(user.email)
  );
}

export async function requireAdminUser() {
  const user = await requireUser();

  if (!isAdminUser(user)) {
    redirect("/sign-in?error=admin_access_required");
  }

  return user;
}

export function getDevAdminHint() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const allowlist = getDevAdminAllowlist();
  return allowlist.length > 0 ? allowlist.join(", ") : null;
}

export async function setDevSession(email: string) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(DEV_SESSION_COOKIE, JSON.stringify({ email: email.toLowerCase(), role: "admin" }), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24
  });
}

export async function clearDevSession() {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.delete(DEV_SESSION_COOKIE);
}

export function getDevFixedOtp() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return process.env.DEV_FIXED_OTP?.trim() || "246810";
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function useDevAuthFallback() {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  return !isSupabaseConfigured() || Boolean(getDevFixedOtp());
}
