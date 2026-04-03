import { BadgeCheck, FileCheck2, MapPinned, Users } from "lucide-react";
import { savePriestReview } from "../../actions/priests";
import { AdminShell } from "../../../components/admin-shell";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { requireAdminUser } from "../../../lib/auth";
import { getPriestMetrics, getPriestStore } from "../../../lib/priest-store";

export const dynamic = "force-dynamic";

type PriestsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const messageMap: Record<string, string> = {
  priest_review_saved: "Priest review updated and stored for local UAT."
};

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function PriestsPage({ searchParams }: PriestsPageProps) {
  const user = await requireAdminUser();
  const store = await getPriestStore();
  const metricsSnapshot = getPriestMetrics(store);
  const resolvedSearchParams = (await searchParams) ?? {};
  const messageKey = readParam(resolvedSearchParams, "message");
  const bannerMessage = messageKey ? messageMap[messageKey] ?? null : null;

  const metrics = [
    { label: "Total priests", value: metricsSnapshot.totalPriests, icon: Users },
    { label: "Verified", value: metricsSnapshot.verifiedPriests, icon: BadgeCheck },
    { label: "Pending KYC", value: metricsSnapshot.pendingKyc, icon: FileCheck2 },
    { label: "Districts covered", value: metricsSnapshot.districtsCovered, icon: MapPinned }
  ];

  return (
    <AdminShell
      active="priests"
      subtitle="Module 2 now handles real onboarding review, manual KYC decisions, and verification controls with persisted local state."
      title="Priest Management"
      userEmail={user.email}
    >
      {bannerMessage ? (
        <div className="rounded-[24px] border border-success/20 bg-success/10 px-4 py-3 text-sm font-medium text-success">
          {bannerMessage}
        </div>
      ) : null}

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
            <CardDescription>Admin can review each priest, update KYC state, and manage verification readiness.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[720px] space-y-4 overflow-y-auto pr-2 surface-scroll">
            {store.priests.map((priest) => (
              <form action={savePriestReview} className="rounded-[24px] border border-border bg-white p-4" key={priest.id}>
                <input name="id" type="hidden" value={priest.id} />
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3 xl:max-w-[320px]">
                    <div>
                      <p className="text-base font-semibold text-foreground">{priest.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {priest.locality}, {priest.district}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={priest.kycStatus === "approved" ? "success" : priest.kycStatus === "review" ? "outline" : "secondary"}>
                        KYC {priest.kycStatus}
                      </Badge>
                      <Badge variant={priest.verificationStatus === "verified" ? "success" : priest.verificationStatus === "review" ? "outline" : "secondary"}>
                        {priest.verificationStatus}
                      </Badge>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">Services: {priest.services.join(", ")}</p>
                    <p className="text-sm leading-6 text-muted-foreground">Documents: {priest.documents.join(", ")}</p>
                    <p className="text-sm leading-6 text-muted-foreground">Contact: {priest.phone}</p>
                    <p className="text-sm leading-6 text-muted-foreground">Submitted {priest.submittedAt}</p>
                  </div>

                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      <span>KYC status</span>
                      <select
                        className="h-11 rounded-[22px] border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        defaultValue={priest.kycStatus}
                        name="kycStatus"
                      >
                        <option value="pending">pending</option>
                        <option value="review">review</option>
                        <option value="approved">approved</option>
                        <option value="rejected">rejected</option>
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      <span>Verification status</span>
                      <select
                        className="h-11 rounded-[22px] border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        defaultValue={priest.verificationStatus}
                        name="verificationStatus"
                      >
                        <option value="unverified">unverified</option>
                        <option value="review">review</option>
                        <option value="verified">verified</option>
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      <span>Travel radius (km)</span>
                      <Input defaultValue={priest.radiusKm} min={0} name="radiusKm" type="number" />
                    </label>
                    <div className="sm:col-span-2">
                      <label className="grid gap-2 text-sm font-semibold text-foreground">
                        <span>Admin notes</span>
                        <textarea
                          className="min-h-28 rounded-[22px] border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                          defaultValue={priest.notes}
                          name="notes"
                        />
                      </label>
                    </div>
                    <div className="sm:col-span-2 flex justify-end">
                      <Button type="submit">Save priest review</Button>
                    </div>
                  </div>
                </div>
              </form>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Mandatory onboarding fields</CardTitle>
            <CardDescription>These remain required so verification is auditable and district coverage is reliable.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[720px] space-y-3 overflow-y-auto pr-2 surface-scroll">
            {store.requirements.map((item) => (
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
