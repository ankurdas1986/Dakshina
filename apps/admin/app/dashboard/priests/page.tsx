import { BadgeCheck, FileCheck2, MapPinned, Users } from "lucide-react";
import { AdminShell } from "../../../components/admin-shell";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { priestSnapshot } from "../../../lib/admin-data";
import { requireAdminUser } from "../../../lib/auth";

const metrics = [
  { label: "Total priests", value: priestSnapshot.totals.totalPriests, icon: Users },
  { label: "Verified", value: priestSnapshot.totals.verifiedPriests, icon: BadgeCheck },
  { label: "Pending KYC", value: priestSnapshot.totals.pendingKyc, icon: FileCheck2 },
  { label: "Districts covered", value: priestSnapshot.totals.districtsCovered, icon: MapPinned }
];

export default async function PriestsPage() {
  const user = await requireAdminUser();

  return (
    <AdminShell
      active="priests"
      subtitle="Manage onboarding, manual verification, coverage radius, and launch-market supply quality."
      title="Priest Management"
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

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Onboarding and KYC queue</CardTitle>
            <CardDescription>Every priest remains under manual review before public listing.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[520px] space-y-3 overflow-y-auto pr-2 surface-scroll">
            {priestSnapshot.queue.map((priest) => (
              <div className="rounded-[24px] border border-border bg-white p-4" key={priest.name}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-base font-semibold text-foreground">{priest.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {priest.locality}, {priest.district}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">Services: {priest.services.join(", ")}</p>
                  </div>
                  <div className="flex flex-col items-start gap-2 lg:items-end">
                    <Badge variant={priest.kycStatus === "approved" ? "success" : priest.kycStatus === "review" ? "outline" : "secondary"}>
                      {priest.kycStatus}
                    </Badge>
                    <p className="text-sm text-muted-foreground">Radius {priest.radiusKm} km</p>
                    <p className="text-sm text-muted-foreground">Submitted {priest.submittedAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Mandatory onboarding fields</CardTitle>
            <CardDescription>These stay required in the MVP to keep verification auditable.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[520px] space-y-3 overflow-y-auto pr-2 surface-scroll">
            {priestSnapshot.requirements.map((item) => (
              <div className="rounded-[20px] border border-border bg-white p-4" key={item}>
                <p className="text-sm font-semibold text-foreground">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

