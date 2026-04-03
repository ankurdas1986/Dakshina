import Image from "next/image";
import type { ReactNode } from "react";
import { verifyEmailOtp } from "../actions/auth";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { getDevAdminHint, getDevFixedOtp, isSupabaseConfigured } from "../../lib/auth";

export const dynamic = "force-dynamic";

type SignInPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const message = readParam(resolvedSearchParams, "message");
  const error = readParam(resolvedSearchParams, "error");
  const email = readParam(resolvedSearchParams, "email") ?? "";
  const devAdminHint = getDevAdminHint();
  const devFixedOtp = getDevFixedOtp();
  const supabaseConfigured = isSupabaseConfigured();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-[460px] rounded-[32px] border-border/80 bg-white shadow-soft">
        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="flex flex-col items-center text-center">
            <Image
              alt="Dakshina Direct logo"
              className="h-auto w-full max-w-[280px]"
              height={420}
              priority
              src="/brand/logo.png"
              width={1280}
            />
            <div className="mt-3 space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin login</h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Sign in to manage Dakshina operations.
              </p>
            </div>
          </div>

          {message ? <Banner tone="success" text={message} /> : null}
          {error ? <Banner tone="error" text={error} /> : null}
          {!supabaseConfigured ? <Banner tone="info" text="Supabase is not configured. Dev OTP mode is active." /> : null}
          {devAdminHint ? <Banner tone="info" text={`Dev admin: ${devAdminHint}`} /> : null}
          {devFixedOtp ? <Banner tone="info" text={`Dev OTP: ${devFixedOtp}`} /> : null}

          <form action={verifyEmailOtp} className="space-y-4">
            <Field label="Email">
              <Input defaultValue={email} name="email" type="email" required />
            </Field>
            <Field label="One-time code">
              <Input inputMode="numeric" name="token" pattern="[0-9]{6}" required />
            </Field>
            <Button className="w-full" type="submit">
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

type FieldProps = {
  label: string;
  children: ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

type BannerProps = {
  tone: "success" | "error" | "info";
  text: string;
};

function Banner({ tone, text }: BannerProps) {
  const toneClass =
    tone === "success"
      ? "border-success/20 bg-success/10 text-success"
      : tone === "error"
        ? "border-destructive/20 bg-destructive/10 text-destructive"
        : "border-primary/20 bg-primary/10 text-foreground";

  return <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${toneClass}`}>{text}</div>;
}
