import { MapPinned, ShieldCheck, UserRoundCheck } from "lucide-react";
import { signOut } from "../actions/auth";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { requirePriestUser } from "../../lib/auth";

export const dynamic = "force-dynamic";

export default async function PriestDashboardPage() {
  const priest = await requirePriestUser();

  return (
    <main className="container py-10">
      <div className="grid gap-6">
        <Card className="border-border/80 bg-white">
          <CardHeader>
            <CardTitle>Priest workspace</CardTitle>
            <CardDescription>This is the foundation dashboard for the priest account. KYC upload, service mapping, and booking inbox will be added on top of this account shell.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Registered priest</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{priest.name}</h1>
                <p className="mt-2 text-base text-muted-foreground">{priest.email ?? "No email captured"} | {priest.phone}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard icon={MapPinned} label="Service area" value={`${priest.locality}, ${priest.district}`} />
                <MetricCard icon={ShieldCheck} label="KYC state" value={priest.kycStatus} />
                <MetricCard icon={UserRoundCheck} label="Verification" value={priest.verificationStatus} />
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-secondary/20 p-5">
              <p className="text-sm leading-7 text-muted-foreground">
                This account is active and distinct, which means multiple priests can register on the platform without overwriting each other. The admin team already sees this record in the priest queue.
              </p>
              <form action={signOut} className="mt-6">
                <Button type="submit" variant="secondary">Sign out</Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value
}: {
  icon: typeof MapPinned;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}
