import { KeyRound, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { requestMagicLink, verifyEmailOtp } from "./actions/auth";
import { DakshinaLogo } from "../components/dakshina-logo";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { getDevAdminHint, getDevFixedOtp, isSupabaseConfigured } from "../lib/auth";

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

export default async function AdminHomePage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const message = readParam(resolvedSearchParams, "message");
  const error = readParam(resolvedSearchParams, "error");
  const email = readParam(resolvedSearchParams, "email") ?? "";
  const next = readParam(resolvedSearchParams, "next") ?? "/dashboard";
  const devAdminHint = getDevAdminHint();
  const devFixedOtp = getDevFixedOtp();
  const supabaseConfigured = isSupabaseConfigured();

  return (
    <main className="min-h-screen bg-transparent px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[32px] border-border/80 bg-white">
          <CardContent className="space-y-8 p-6 md:p-10">
            <DakshinaLogo />
            <div className="space-y-5">
              <Badge className="rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.24em]" variant="secondary">
                Admin access
              </Badge>
              <div className="space-y-4">
                <h2 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
                  Sign in to the Dakshina control layer.
                </h2>
                <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                  This admin surface manages the commercial and operational backbone of Dakshina.
                  The current development flow supports fixed OTP so you can review the product
                  without waiting on live email delivery.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard
                title="Responsive admin"
                description="Every module is being built mobile-safe and desktop-strong from the first screen."
              />
              <InfoCard
                title="shadcn foundation"
                description="The interface now uses a component system instead of custom one-off page scaffolds."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-border/80 bg-white">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <Badge className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]" variant="outline">
                Authentication
              </Badge>
            </div>
            <CardTitle className="text-3xl">Email-based admin sign-in</CardTitle>
            <CardDescription>
              Real product auth will use Supabase Email OTP or Magic Links. Development mode can
              run on fixed OTP for local review.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {message ? <Banner tone="success" text={message} /> : null}
            {error ? <Banner tone="error" text={error} /> : null}
            {!supabaseConfigured ? <Banner tone="info" text="Supabase is not configured. Dev OTP mode is active." /> : null}
            {devAdminHint ? <Banner tone="info" text={`Local dev admin fallback enabled for: ${devAdminHint}`} /> : null}
            {devFixedOtp ? <Banner tone="info" text={`Local fixed OTP enabled: ${devFixedOtp}`} /> : null}

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="rounded-[26px] border-border/80 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl">Send magic link</CardTitle>
                  <CardDescription>In local dev this will show the fixed OTP message.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={requestMagicLink} className="space-y-4">
                    <Field label="Email">
                      <Input defaultValue={email} name="email" type="email" required />
                    </Field>
                    <input type="hidden" name="next" value={next} />
                    <Button className="w-full" type="submit">
                      Send link
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="rounded-[26px] border-border/80 bg-white">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-primary" />
                    <CardTitle className="text-xl">Verify OTP</CardTitle>
                  </div>
                  <CardDescription>Use the fixed local OTP while development auth is active.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={verifyEmailOtp} className="space-y-4">
                    <Field label="Email">
                      <Input defaultValue={email} name="email" type="email" required />
                    </Field>
                    <Field label="One-time code">
                      <Input name="token" inputMode="numeric" pattern="[0-9]{6}" required />
                    </Field>
                    <Button className="w-full" type="submit">
                      Verify code
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="text-sm text-muted-foreground">
              Admin access will later be restricted to users with role metadata of <code>admin</code>.
            </div>
          </CardContent>
        </Card>
      </div>
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

type InfoCardProps = {
  title: string;
  description: string;
};

function InfoCard({ title, description }: InfoCardProps) {
  return (
    <Card className="rounded-[24px] border-border/80 bg-white">
      <CardContent className="space-y-2 p-5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
