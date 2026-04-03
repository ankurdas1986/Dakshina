import { Bell, BellDot, Landmark, MapPinned, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import {
  saveControlSettings,
  saveDistrictSettings,
  saveNotificationSettings,
  savePlatformSettings
} from "../actions/settings";
import { AdminShell } from "../../components/admin-shell";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { getAdminShellData } from "../../lib/admin-shell-data";
import { moduleStatus } from "../../lib/admin-data";
import { requireAdminUser } from "../../lib/auth";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const messageMap: Record<string, string> = {
  platform_settings_saved: "Platform settings saved for local UAT.",
  district_settings_saved: "District commission settings saved for local UAT.",
  policy_controls_saved: "Policy controls saved for local UAT.",
  notification_settings_saved: "Notification settings saved for local UAT."
};

const checkboxClassName =
  "mt-1 h-4 w-4 rounded border-border accent-[hsl(var(--primary))] focus:ring-primary";

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireAdminUser();
  const { notifications, notificationCount, notificationEnabled, settings } = await getAdminShellData();
  const resolvedSearchParams = (await searchParams) ?? {};
  const messageKey = readParam(resolvedSearchParams, "message");
  const query = readParam(resolvedSearchParams, "q")?.toLowerCase() ?? "";
  const bannerMessage = messageKey ? messageMap[messageKey] ?? null : null;
  const matchesSection = (value: string) => !query || value.toLowerCase().includes(query);

  const launchMetrics = [
    {
      label: "Default commission",
      value: `${settings.platform.defaultCommissionPercent}%`,
      detail: "Base rate before district overrides.",
      icon: Wallet
    },
    {
      label: "Advance payment",
      value: `${settings.platform.bookingAdvancePercent}%`,
      detail: "Required before any contact reveal.",
      icon: ShieldCheck
    },
    {
      label: "Reveal timing",
      value: `${settings.platform.revealWindowHours.min}-${settings.platform.revealWindowHours.max} hr`,
      detail: "Numbers open close to ritual start.",
      icon: BellDot
    }
  ];

  return (
    <AdminShell
      active="settings"
      notificationCount={notificationCount}
      notificationEnabled={notificationEnabled}
      notifications={notifications}
      subtitle="Module 1 now runs as the first editable super-admin module, with local persistence for UAT before Supabase wiring."
      title="Global Settings"
      userEmail={user.email}
      subnav={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">Commercial rules</Badge>
          <Badge variant="outline">District overrides</Badge>
          <Badge variant="outline">Policy controls</Badge>
          <Badge variant="outline">Notifications</Badge>
        </div>
      }
    >
      {bannerMessage ? (
        <div className="rounded-[24px] border border-success/20 bg-success/10 px-4 py-3 text-sm font-medium text-success">
          {bannerMessage}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader className="pb-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Module 1 operating rules</CardTitle>
                <CardDescription>
                  These values are now editable and saved locally for UAT. Later modules will read from the same settings contract.
                </CardDescription>
              </div>
              <Badge variant="success">Editable</Badge>
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
            <CardDescription>The full admin surface remains split into focused modules with explicit ownership.</CardDescription>
          </CardHeader>
          <CardContent className="surface-scroll max-h-[420px] space-y-3 overflow-y-auto pr-2">
            {moduleStatus
              .filter((module) =>
                matchesSection([module.title, module.summary].join(" "))
              )
              .map((module) => (
              <div className="rounded-[22px] border border-border bg-white p-4" key={module.key}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{module.title}</p>
                  <Badge variant={module.key === "settings" ? "success" : "outline"}>{module.status}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.summary}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        {matchesSection("commercial settings default commission advance payment referee discount referrer reward reveal window launch cluster currency") ? (
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Commercial settings</CardTitle>
                <CardDescription>Primary economics and privacy timing rules for the marketplace.</CardDescription>
              </div>
              <Badge variant="success">Module 1</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <form action={savePlatformSettings} className="grid gap-4 sm:grid-cols-2">
              <Field label="Currency" name="currency" defaultValue={settings.platform.currency} />
              <Field label="Launch cluster" name="launchRegion" defaultValue={settings.platform.launchRegion} />
              <NumberField
                label="Default commission (%)"
                name="defaultCommissionPercent"
                defaultValue={settings.platform.defaultCommissionPercent}
              />
              <NumberField
                label="Advance payment (%)"
                name="bookingAdvancePercent"
                defaultValue={settings.platform.bookingAdvancePercent}
              />
              <NumberField
                label="Referee discount (%)"
                name="refereeDiscountPercent"
                defaultValue={settings.platform.refereeDiscountPercent}
              />
              <NumberField
                label="Referrer reward (Rs)"
                name="referrerRewardCredit"
                defaultValue={settings.platform.referrerRewardCredit}
              />
              <NumberField
                label="Reveal window min (hours)"
                name="revealWindowMin"
                defaultValue={settings.platform.revealWindowHours.min}
              />
              <NumberField
                label="Reveal window max (hours)"
                name="revealWindowMax"
                defaultValue={settings.platform.revealWindowHours.max}
              />
              <div className="flex justify-end sm:col-span-2">
                <Button type="submit">Save commercial settings</Button>
              </div>
            </form>
          </CardContent>
        </Card>
        ) : null}

        {matchesSection("policy controls manual kyc otp replacement auto approval feature flags") ? (
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Policy controls</CardTitle>
                <CardDescription>Feature flags that govern trust and anti-leakage behavior.</CardDescription>
              </div>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <form action={saveControlSettings} className="surface-scroll max-h-[420px] space-y-3 overflow-y-auto pr-2">
              {settings.controls.map((control, index) => (
                <label className="flex items-start gap-3 rounded-[22px] border border-border bg-white p-4" key={control.label}>
                  <input
                    className={checkboxClassName}
                    defaultChecked={control.enabled}
                    name={`controlEnabled-${index}`}
                    type="checkbox"
                  />
                  <span className="space-y-1">
                    <span className="block text-sm font-semibold text-foreground">{control.label}</span>
                    <span className="block text-sm leading-6 text-muted-foreground">{control.description}</span>
                  </span>
                </label>
              ))}
              <div className="flex justify-end">
                <Button type="submit" variant="secondary">
                  Save policy controls
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {matchesSection("district commission overrides regional service clusters") ? (
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">District commission overrides</CardTitle>
                <CardDescription>Each district can override the default commission and service cluster scope.</CardDescription>
              </div>
              <Badge variant="outline">Regional</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <form action={saveDistrictSettings} className="surface-scroll max-h-[460px] space-y-3 overflow-y-auto pr-2">
              {settings.districts.map((district, index) => (
                <div className="rounded-[22px] border border-border bg-white p-4" key={district.district}>
                  <div className="mb-3 flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground">District override {index + 1}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="District" name={`districtName-${index}`} defaultValue={district.district} />
                    <NumberField
                      label="Commission (%)"
                      name={`districtCommission-${index}`}
                      defaultValue={district.commissionPercent}
                    />
                    <div className="sm:col-span-2">
                      <label className="grid gap-2 text-sm font-semibold text-foreground">
                        <span>Service clusters</span>
                        <textarea
                          className="min-h-24 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                          defaultValue={district.serviceClusters.join(", ")}
                          name={`districtClusters-${index}`}
                        />
                      </label>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="grid gap-2 text-sm font-semibold text-foreground">
                        <span>Status</span>
                        <select
                          className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          defaultValue={district.status}
                          name={`districtStatus-${index}`}
                        >
                          <option value="active">active</option>
                          <option value="review">review</option>
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <Button type="submit">Save district overrides</Button>
              </div>
            </form>
          </CardContent>
        </Card>
        ) : null}

        {matchesSection("notification settings admin inbox booking alerts kyc alerts referral alerts daily digest unread badge") ? (
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Notification settings</CardTitle>
                <CardDescription>Admin controls which operational events land in the inbox and digest.</CardDescription>
              </div>
              <Bell className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <form action={saveNotificationSettings} className="surface-scroll max-h-[460px] space-y-3 overflow-y-auto pr-2">
              <label className="flex items-start gap-3 rounded-[22px] border border-border bg-white p-4">
                <input
                  className={checkboxClassName}
                  defaultChecked={settings.notificationSettings.adminInboxEnabled}
                  name="adminInboxEnabled"
                  type="checkbox"
                />
                <span>
                  <span className="block text-sm font-semibold text-foreground">Admin inbox enabled</span>
                  <span className="block text-sm leading-6 text-muted-foreground">Enable the top-right notification inbox icon for operators.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-[22px] border border-border bg-white p-4">
                <input
                  className={checkboxClassName}
                  defaultChecked={settings.notificationSettings.registrationAlertsEnabled}
                  name="registrationAlertsEnabled"
                  type="checkbox"
                />
                <span>
                  <span className="block text-sm font-semibold text-foreground">Registration alerts</span>
                  <span className="block text-sm leading-6 text-muted-foreground">Notify admin when a new priest or user registration is submitted.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-[22px] border border-border bg-white p-4">
                <input
                  className={checkboxClassName}
                  defaultChecked={settings.notificationSettings.bookingAlertsEnabled}
                  name="bookingAlertsEnabled"
                  type="checkbox"
                />
                <span>
                  <span className="block text-sm font-semibold text-foreground">Booking alerts</span>
                  <span className="block text-sm leading-6 text-muted-foreground">Notify admin for confirmations, failures, replacement risks, and timing issues.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-[22px] border border-border bg-white p-4">
                <input
                  className={checkboxClassName}
                  defaultChecked={settings.notificationSettings.kycAlertsEnabled}
                  name="kycAlertsEnabled"
                  type="checkbox"
                />
                <span>
                  <span className="block text-sm font-semibold text-foreground">KYC alerts</span>
                  <span className="block text-sm leading-6 text-muted-foreground">Notify admin when new priest documents or verification tasks require review.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-[22px] border border-border bg-white p-4">
                <input
                  className={checkboxClassName}
                  defaultChecked={settings.notificationSettings.referralAlertsEnabled}
                  name="referralAlertsEnabled"
                  type="checkbox"
                />
                <span>
                  <span className="block text-sm font-semibold text-foreground">Referral alerts</span>
                  <span className="block text-sm leading-6 text-muted-foreground">Notify admin when referral rewards become eligible for settlement.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-[22px] border border-border bg-white p-4">
                <input
                  className={checkboxClassName}
                  defaultChecked={settings.notificationSettings.dailyDigestEnabled}
                  name="dailyDigestEnabled"
                  type="checkbox"
                />
                <span>
                  <span className="block text-sm font-semibold text-foreground">Daily digest</span>
                  <span className="block text-sm leading-6 text-muted-foreground">Keep a daily summary for bookings, KYC queue, and trust operations.</span>
                </span>
              </label>
              <div className="rounded-[22px] border border-border bg-secondary/20 px-4 py-3">
                <p className="text-sm font-semibold text-foreground">Current unread notifications</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  The inbox badge is calculated from active notification events. Current unread count: {notificationCount}.
                </p>
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="secondary">
                  Save notification settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        ) : null}
      </div>

      {matchesSection("audit log change history settings updates") ? (
      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Settings audit log</CardTitle>
          <CardDescription>Recent super-admin setting changes are recorded here for operational traceability.</CardDescription>
        </CardHeader>
        <CardContent className="surface-scroll max-h-[320px] space-y-3 overflow-y-auto pr-2">
          {settings.auditLog.map((entry) => (
            <div className="rounded-[22px] border border-border bg-white p-4" key={entry.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">{entry.action}</p>
                <span className="text-xs text-muted-foreground">{entry.createdAt}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.detail}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{entry.actor}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      ) : null}

      {matchesSection("official 4-tier service model tier essential home grand event barwari monthly trustee") ? (
      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Official 4-tier service model</CardTitle>
              <CardDescription>The tier model is stable and remains visible while ritual CRUD is built next.</CardDescription>
            </div>
            <MapPinned className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="surface-scroll max-h-[460px] space-y-3 overflow-y-auto pr-2">
          {settings.serviceTiers.map((tier) => (
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
      ) : null}
    </AdminShell>
  );
}

type FieldProps = {
  label: string;
  name: string;
  defaultValue: string;
};

function Field({ label, name, defaultValue }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span>{label}</span>
      <Input defaultValue={defaultValue} name={name} required />
    </label>
  );
}

type NumberFieldProps = {
  label: string;
  name: string;
  defaultValue: number;
};

function NumberField({ label, name, defaultValue }: NumberFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span>{label}</span>
      <Input defaultValue={defaultValue} min={0} name={name} required type="number" />
    </label>
  );
}

