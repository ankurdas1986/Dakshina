import Image from "next/image";
import Link from "next/link";
import { requestMagicLink, verifyEmailOtp } from "./actions/auth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { getDevFixedOtp, isSupabaseConfigured } from "../lib/auth";

export const dynamic = "force-dynamic";

type PriestSignInPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function PriestSignInPage({ searchParams }: PriestSignInPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const message = readParam(resolvedSearchParams, "message");
  const error = readParam(resolvedSearchParams, "error");
  const email = readParam(resolvedSearchParams, "email") ?? "";
  const devFixedOtp = getDevFixedOtp();
  const supabaseConfigured = isSupabaseConfigured();

  return (
    <main className="container flex min-h-screen items-center justify-center py-10">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="overflow-hidden border-border/80 bg-white">
          <CardContent className="flex h-full flex-col justify-between gap-8 p-8 lg:p-10">
            <div className="space-y-8">
              <Image
                alt="Dakshina Hub"
                className="h-auto w-full max-w-[280px]"
                height={420}
                priority
                src="/brand/logo.png"
                width={1280}
              />
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-muted-foreground">Priest portal</p>
                <h1 className="max-w-xl text-4xl font-bold tracking-tight text-foreground">
                  Register once, manage every Dakshina assignment from one clean workspace.
                </h1>
                <p className="max-w-xl text-base leading-7 text-muted-foreground">
                  This foundation is focused on priest onboarding, sign-in, and profile identity. Ritual mapping, KYC uploads, and booking inbox will extend on top of the same account.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <InfoCard label="Registration model" value="Multiple priests supported" />
              <InfoCard label="Auth" value="Email OTP / magic link ready" />
              <InfoCard label="Admin visibility" value="New signup triggers inbox alert" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Priest login</CardTitle>
              <CardDescription>Use your registered email to request a sign-in code.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {message ? <Banner tone="success" text={message} /> : null}
              {error ? <Banner tone="error" text={humanizeError(error)} /> : null}
              {!supabaseConfigured ? (
                <Banner tone="info" text={`Supabase is not configured. Dev OTP mode is active: ${devFixedOtp}`} />
              ) : null}

              <form action={requestMagicLink} className="space-y-4">
                <Field label="Registered email">
                  <Input defaultValue={email} name="email" required type="email" />
                </Field>
                <Button className="w-full" type="submit">
                  Send OTP or magic link
                </Button>
              </form>

              <form action={verifyEmailOtp} className="space-y-4 border-t border-border pt-4">
                <Field label="Email">
                  <Input defaultValue={email} name="email" required type="email" />
                </Field>
                <Field label="One-time code">
                  <Input inputMode="numeric" name="token" pattern="[0-9]{6}" required />
                </Field>
                <Button className="w-full" type="submit" variant="secondary">
                  Verify and continue
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>New priest registration</CardTitle>
              <CardDescription>Create a new priest account before signing in.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/register">Open registration form</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function humanizeError(error: string) {
  const map: Record<string, string> = {
    missing_email: "Email is required.",
    registration_required: "No priest registration exists for this email yet.",
    missing_otp_details: "Email and OTP are both required.",
    invalid_fixed_otp: "The development OTP is incorrect.",
    priest_login_required: "Please sign in to access the priest workspace."
  };

  return map[error] ?? error;
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/25 px-4 py-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Banner({ tone, text }: { tone: "success" | "error" | "info"; text: string }) {
  const toneClass =
    tone === "success"
      ? "border-success/20 bg-success/10 text-success"
      : tone === "error"
        ? "border-destructive/20 bg-destructive/10 text-destructive"
        : "border-primary/20 bg-primary/10 text-foreground";

  return <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${toneClass}`}>{text}</div>;
}
