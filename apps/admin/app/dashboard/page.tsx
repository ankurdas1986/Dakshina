import { BellDot, Landmark, MapPinned, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { AdminShell } from "../../components/admin-shell";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { moduleStatus } from "../../lib/admin-data";
import { requireAdminUser } from "../../lib/auth";
import { settingsSnapshot } from "../../lib/settings";

const launchMetrics = [
  {
    label: "Default commission",
    value: `${settingsSnapshot.platform.defaultCommissionPercent}%`,
    detail: "Base rate before district overrides.",
    icon: Wallet
  },
  {
    label: "Advance payment",
    value: `${settingsSnapshot.platform.bookingAdvancePercent}%`,
    detail: "Required before any contact reveal.",
    icon: ShieldCheck
  },
  {
    label: "Reveal timing",
    value: `${settingsSnapshot.platform.revealWindowHours.min}-${settingsSnapshot.platform.revealWindowHours.max} hr`,
    detail: "Numbers open close to ritual start.",
    icon: BellDot
  }
];

export default async function DashboardPage() {
  const user = await requireAdminUser();

  return (
    <AdminShell
      active="settings"
      subtitle="Module 1 defines platform economics, launch geography, delayed contact reveal, and the official service model."
      title="Global Settings"
      userEmail={user.email}
    >
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader className="pb-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Module 1 operating rules</CardTitle>
                <CardDescription>
                  These values are read by onboarding, ritual catalog, booking controls, and trust settlement.
                </CardDescription>
              </div>
              <Badge variant="success">Live</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {launchMetrics.map((metric) => {
              const Icon = metric.icon;

              return (
                <div className="rounded-[24px] border border-border bg-white p-5" key={metric.label}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                        {metric.label}
                      </p>
                      <p className="text-2xl font-extrabold tracking-tight text-foreground">{metric.value}</p>
                    </div>
                    <div className="rounded-2xl bg-primary/10 p-2.5">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{metric.detail}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader className="pb-5">
            <CardTitle className="text-lg">Admin module map</CardTitle>
            <CardDescription>The full admin surface is broken into focused modules instead of one overloaded screen.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[420px] space-y-3 overflow-y-auto pr-2 surface-scroll">
            {moduleStatus.map((module) => (
              <div className="rounded-[22px] border border-border bg-white p-4" key={module.key}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{module.title}</p>
                  <Badge variant="success">{module.status}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.summary}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Commercial settings</CardTitle>
                <CardDescription>Core platform pricing and payout behavior.</CardDescription>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <SettingField label="Currency" value={settingsSnapshot.platform.currency} />
            <SettingField label="Default commission" value={`${settingsSnapshot.platform.defaultCommissionPercent}%`} />
            <SettingField label="Advance payment" value={`${settingsSnapshot.platform.bookingAdvancePercent}%`} />
            <SettingField label="Referee discount" value={`${settingsSnapshot.platform.refereeDiscountPercent}%`} />
            <SettingField label="Referrer reward" value={`Rs ${settingsSnapshot.platform.referrerRewardCredit}`} />
            <SettingField
              label="Phone reveal window"
              value={`${settingsSnapshot.platform.revealWindowHours.min} to ${settingsSnapshot.platform.revealWindowHours.max} hours`}
            />
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Launch region and policy flags</CardTitle>
                <CardDescription>Service area and trust controls for the initial market cluster.</CardDescription>
              </div>
              <MapPinned className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="max-h-[420px] space-y-3 overflow-y-auto pr-2 surface-scroll">
            <SettingField label="Launch cluster" value={settingsSnapshot.platform.launchRegion} />
            {settingsSnapshot.controls.map((control) => (
              <div className="rounded-[22px] border border-border bg-white p-4" key={control.label}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{control.label}</p>
                  <Badge variant={control.enabled ? "success" : "secondary"}>{control.enabled ? "Enabled" : "Disabled"}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{control.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">District commission overrides</CardTitle>
                <CardDescription>Regional flexibility for launch market economics.</CardDescription>
              </div>
              <Badge variant="outline">Regional</Badge>
            </div>
          </CardHeader>
          <CardContent className="max-h-[440px] space-y-3 overflow-y-auto pr-2 surface-scroll">
            {settingsSnapshot.districts.map((district) => (
              <div className="rounded-[22px] border border-border bg-white p-4" key={district.district}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-primary" />
                      <p className="text-sm font-semibold text-foreground">{district.district}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{district.serviceClusters.join(", ")}</p>
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <p className="text-sm font-semibold text-foreground">{district.commissionPercent}% commission</p>
                    <Badge variant={district.status === "active" ? "success" : "secondary"}>{district.status}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Official 4-tier service model</CardTitle>
                <CardDescription>Catalog structure that will drive rituals, pricing, and Fard templates.</CardDescription>
              </div>
              <Badge variant="success">Configured</Badge>
            </div>
          </CardHeader>
          <CardContent className="max-h-[440px] space-y-3 overflow-y-auto pr-2 surface-scroll">
            {settingsSnapshot.serviceTiers.map((tier) => (
              <div className="rounded-[22px] border border-border bg-white p-4" key={tier.name}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{tier.name}</p>
                  <Badge variant={tier.status === "active" ? "success" : "secondary"}>{tier.status}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{tier.focus}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Trust and anti-leakage controls</CardTitle>
              <CardDescription>These safeguards are part of the business model, not decorative settings.</CardDescription>
            </div>
            <Badge variant="outline">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Policy layer
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {settingsSnapshot.controls.map((control) => (
            <div className="rounded-[22px] border border-border bg-white p-4" key={control.label}>
              <p className="text-sm font-semibold text-foreground">{control.label}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{control.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminShell>
  );
}

type SettingFieldProps = {
  label: string;
  value: string;
};

function SettingField({ label, value }: SettingFieldProps) {
  return (
    <div className="rounded-[22px] border border-border bg-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}
