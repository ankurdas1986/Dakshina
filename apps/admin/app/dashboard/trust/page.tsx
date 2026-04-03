import { MessageSquareQuote, ShieldCheck, Star, WalletCards } from "lucide-react";
import { AdminShell } from "../../../components/admin-shell";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { trustSnapshot } from "../../../lib/admin-data";
import { requireAdminUser } from "../../../lib/auth";

export const dynamic = "force-dynamic";

const metrics = [
  { label: "Average rating", value: trustSnapshot.metrics.averageRating, icon: Star },
  { label: "Reviews pending", value: trustSnapshot.metrics.reviewsAwaitingModeration, icon: MessageSquareQuote },
  { label: "Referral credits pending", value: trustSnapshot.metrics.referralCreditsPending, icon: WalletCards },
  { label: "Priests below threshold", value: trustSnapshot.metrics.priestsBelowThreshold, icon: ShieldCheck }
];

export default async function TrustPage() {
  const user = await requireAdminUser();

  return (
    <AdminShell
      active="trust"
      subtitle="Track marketplace quality, review eligibility, and referral reward release after OTP-based completion."
      title="Trust and Referral"
      userEmail={user.email}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card className="rounded-[24px] border-border/80 bg-white" key={metric.label}>
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{metric.label}</p>
                  <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">{metric.value}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 p-2.5">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Trust controls</CardTitle>
            <CardDescription>Reviewing and rewarding only after valid completion protects the business model.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[460px] space-y-3 overflow-y-auto pr-2 surface-scroll">
            {trustSnapshot.controls.map((control) => (
              <div className="rounded-[24px] border border-border bg-white p-4" key={control.title}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{control.title}</p>
                  <Badge variant={control.state === "active" ? "success" : "secondary"}>{control.state}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{control.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Referral ledger</CardTitle>
            <CardDescription>Reward credit remains completion-gated and auditable from admin.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[460px] space-y-3 overflow-y-auto pr-2 surface-scroll">
            {trustSnapshot.referrals.map((entry) => (
              <div className="rounded-[24px] border border-border bg-white p-4" key={`${entry.referrer}-${entry.referee}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{entry.referrer} {"->"} {entry.referee}</p>
                  <Badge variant={entry.state === "credited" ? "success" : "outline"}>{entry.state}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Booking {entry.firstBooking}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Referee discount {entry.refereeDiscount} | Reward {entry.rewardCredit}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}


