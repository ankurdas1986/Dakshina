import Link from "next/link";
import { submitPriestRegistration } from "../actions/register";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

export const dynamic = "force-dynamic";

type RegistrationPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function RegistrationPage({ searchParams }: RegistrationPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const error = readParam(resolvedSearchParams, "error");
  const email = readParam(resolvedSearchParams, "email") ?? "";

  return (
    <main className="container py-10">
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-border/80 bg-white">
          <CardHeader>
            <CardTitle>Registration scope</CardTitle>
            <CardDescription>This first-pass registration creates a priest identity record and alerts the super admin for KYC review.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>Multiple priest accounts are supported. Each registration creates a distinct pending priest record.</p>
            <p>The admin inbox receives a new registration alert immediately after submission.</p>
            <p>The full KYC document upload and ritual mapping flow will be layered onto this account next.</p>
            <Button asChild variant="secondary">
              <Link href="/">Back to login</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white">
          <CardHeader>
            <CardTitle>Priest registration</CardTitle>
            <CardDescription>Submit your basic identity and service area to start the onboarding process.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{humanizeError(error)}</div> : null}
            <form action={submitPriestRegistration} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name">
                  <Input name="name" required />
                </Field>
                <Field label="Email">
                  <Input defaultValue={email} name="email" required type="email" />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone">
                  <Input name="phone" required />
                </Field>
                <Field label="Travel radius (km)">
                  <Input defaultValue={10} min={1} name="radiusKm" required type="number" />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="District">
                  <Input name="district" required />
                </Field>
                <Field label="Locality">
                  <Input name="locality" required />
                </Field>
              </div>
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                <span>Initial notes</span>
                <textarea
                  className="min-h-28 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  name="notes"
                  placeholder="Optional note about your primary service area or specialization."
                />
              </label>
              <Button type="submit">Submit registration</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function humanizeError(error: string) {
  const map: Record<string, string> = {
    missing_registration_fields: "All required registration fields must be filled.",
    duplicate_priest: "A priest account with this email or phone already exists."
  };

  return map[error] ?? error;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}
