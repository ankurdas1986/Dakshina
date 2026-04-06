import { BellDot, CalendarRange, ShieldCheck, Sparkles } from "lucide-react";
import {
  saveControlSettings,
  saveDistrictSettings,
  saveNotificationSettings,
  savePlatformSettings
} from "../actions/settings";
import { AdminShell } from "../../components/admin-shell";
import { SectionNav } from "../../components/section-nav";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { getAdminShellData } from "../../lib/admin-shell-data";
import { moduleStatus } from "../../lib/admin-data";
import { requireAdminUser } from "../../lib/auth";
import type { CultureType } from "../../lib/settings";

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

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

const cultureOptions: Array<{ value: CultureType; label: string }> = [
  { value: "Bengali", label: "Bengali" },
  { value: "North_Indian", label: "North Indian (UP/Bihar)" },
  { value: "Marwadi", label: "Marwadi" },
  { value: "Odia", label: "Odia" },
  { value: "Gujarati", label: "Gujarati" }
];

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
      label: "Default culture",
      value: settings.platform.defaultCulture.replace("_", " "),
      detail: "Bengali remains the launch priority while the schema supports other traditions.",
      icon: Sparkles
    },
    {
      label: "Advance payment",
      value: `${settings.platform.bookingAdvancePercent}%`,
      detail: "Required before any contact reveal.",
      icon: ShieldCheck
    },
    {
      label: "Min booking gap",
      value: `${settings.platform.minBookingGapHours} hr`,
      detail: "Used to avoid back-to-back double booking pressure.",
      icon: CalendarRange
    },
    {
      label: "Booking window",
      value: `${settings.platform.maxBookingWindowDays} days`,
      detail: "Controls how far ahead bookings can be accepted.",
      icon: BellDot
    }
  ];

  return (
    <AdminShell
      active="settings"
      notificationCount={notificationCount}
      notificationEnabled={notificationEnabled}
      notifications={notifications}
      subtitle="Global settings now govern multicultural rollout, booking intelligence, privacy timing, and Bengali-first launch policy."
      title="Global Settings"
      userEmail={user.email}
      subnav={
        <SectionNav
          items={[
            { href: "#culture-rollout", label: "Culture rollout", primary: true },
            { href: "#commercial-rules", label: "Commercial rules" },
            { href: "#governance", label: "Governance" },
            { href: "#district-overrides", label: "District overrides" },
            { href: "#notifications", label: "Notifications" }
          ]}
        />
      }
    >
      {bannerMessage ? (
        <div className="rounded-[24px] border border-success/20 bg-success/10 px-4 py-3 text-sm font-medium text-success">
          {bannerMessage}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="scroll-mt-28 rounded-[28px] border-border/80 bg-white" id="culture-rollout">
          <CardHeader className="pb-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Marketplace operating rules</CardTitle>
                <CardDescription>
                  These settings now control culture priority, governance, privacy timing, and forced-booking policy.
                </CardDescription>
              </div>
              <Badge variant="success">Editable</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
            {launchMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div className="rounded-[24px] border border-border bg-white p-5" key={metric.label}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{metric.label}</p>
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
            <CardDescription>The admin remains split into focused modules with clear ownership.</CardDescription>
          </CardHeader>
          <CardContent className="surface-scroll space-y-3 pr-2 xl:max-h-none xl:overflow-visible">
            {moduleStatus.filter((module) => matchesSection([module.title, module.summary].join(" "))).map((module) => (
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
        {matchesSection("commercial settings culture booking window commission advance payment reveal window forced booking") ? (
          <Card className="h-full scroll-mt-28 rounded-[28px] border-border/80 bg-white" id="commercial-rules">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Commercial and governance settings</CardTitle>
              <CardDescription>Primary economics, Bengali-first launch preference, and booking intelligence rules.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={savePlatformSettings} className="grid gap-4 sm:grid-cols-2">
                <SelectField label="Default culture" name="defaultCulture" defaultValue={settings.platform.defaultCulture} options={cultureOptions} />
                <Field label="Launch cluster" name="launchRegion" defaultValue={settings.platform.launchRegion} />
                <Field label="Currency" name="currency" defaultValue={settings.platform.currency} />
                <NumberField label="Default commission (%)" name="defaultCommissionPercent" defaultValue={settings.platform.defaultCommissionPercent} />
                <NumberField label="Advance payment (%)" name="bookingAdvancePercent" defaultValue={settings.platform.bookingAdvancePercent} />
                <NumberField label="Referee discount (%)" name="refereeDiscountPercent" defaultValue={settings.platform.refereeDiscountPercent} />
                <NumberField label="Referrer reward (Rs)" name="referrerRewardCredit" defaultValue={settings.platform.referrerRewardCredit} />
                <NumberField label="Min booking gap (hours)" name="minBookingGapHours" defaultValue={settings.platform.minBookingGapHours} />
                <NumberField label="Max booking window (days)" name="maxBookingWindowDays" defaultValue={settings.platform.maxBookingWindowDays} />
                <NumberField label="Reveal window min (hours)" name="revealWindowMin" defaultValue={settings.platform.revealWindowHours.min} />
                <NumberField label="Reveal window max (hours)" name="revealWindowMax" defaultValue={settings.platform.revealWindowHours.max} />
                <label className="flex items-start gap-3 rounded-[22px] border border-border bg-white p-4 sm:col-span-2">
                  <input className={checkboxClassName} defaultChecked={settings.platform.festivalRushBlockingEnabled} name="festivalRushBlockingEnabled" type="checkbox" />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">Festival rush blocking</span>
                    <span className="block text-sm leading-6 text-muted-foreground">Enable blackout-date governance for high-demand festival periods.</span>
                  </span>
                </label>
                <label className="flex items-start gap-3 rounded-[22px] border border-border bg-white p-4 sm:col-span-2">
                  <input className={checkboxClassName} defaultChecked={settings.platform.forceBookingOverrideEnabled} name="forceBookingOverrideEnabled" type="checkbox" />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">Forced booking override</span>
                    <span className="block text-sm leading-6 text-muted-foreground">Allow super admin to bypass rules for manually approved bookings.</span>
                  </span>
                </label>
                <div className="flex justify-end sm:col-span-2">
                  <Button type="submit">Save commercial settings</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {matchesSection("policy controls manual kyc otp replacement reviews blocking") ? (
          <Card className="scroll-mt-28 rounded-[28px] border-border/80 bg-white" id="governance">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Policy controls</CardTitle>
              <CardDescription>Operational feature flags for verification, reviews, and booking protection.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={saveControlSettings} className="space-y-3">
                {settings.controls.map((control, index) => (
                  <label className="flex items-start gap-3 rounded-[22px] border border-border bg-white p-4" key={control.label}>
                    <input className={checkboxClassName} defaultChecked={control.enabled} name={`controlEnabled-${index}`} type="checkbox" />
                    <span className="space-y-1">
                      <span className="block text-sm font-semibold text-foreground">{control.label}</span>
                      <span className="block text-sm leading-6 text-muted-foreground">{control.description}</span>
                    </span>
                  </label>
                ))}
                <div className="flex justify-end">
                  <Button type="submit" variant="secondary">Save policy controls</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {matchesSection("district commission zone travel fee regional service clusters") ? (
          <Card className="scroll-mt-28 rounded-[28px] border-border/80 bg-white" id="district-overrides">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">District overrides and zone fees</CardTitle>
              <CardDescription>District-level commission, travel fee, and service-cluster overrides.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={saveDistrictSettings} className="space-y-3">
                {settings.districts.map((district, index) => (
                  <div className="rounded-[22px] border border-border bg-white p-4" key={district.district}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="District" name={`districtName-${index}`} defaultValue={district.district} />
                      <NumberField label="Commission (%)" name={`districtCommission-${index}`} defaultValue={district.commissionPercent} />
                      <NumberField label="Zone travel fee (Rs)" name={`districtTravelFee-${index}`} defaultValue={district.zoneTravelFee} />
                      <SelectField
                        label="Status"
                        name={`districtStatus-${index}`}
                        defaultValue={district.status}
                        options={[{ value: 'active', label: 'active' }, { value: 'review', label: 'review' }]}
                      />
                      <div className="sm:col-span-2">
                        <TextAreaField label="Service clusters" name={`districtClusters-${index}`} defaultValue={district.serviceClusters.join(', ')} />
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

        {matchesSection("culture research panjika sources ritual samples") ? (
          <Card className="scroll-mt-28 rounded-[28px] border-border/80 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Culture and Panjika research</CardTitle>
              <CardDescription>Bengali is the first launch priority, while other traditions stay ready in the operating model.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {settings.cultureResearch.map((culture) => (
                <div className="rounded-[22px] border border-border bg-white p-4" key={culture.cultureType}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{culture.cultureType.replace('_', ' ')}</p>
                    <Badge variant={culture.isLaunchPriority ? 'success' : 'outline'}>{culture.isLaunchPriority ? 'Launch priority' : 'Supported'}</Badge>
                  </div>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Primary Panjika / Panchang</p>
                  <p className="mt-1 text-sm text-foreground">{culture.sources.join(' / ')}</p>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Sample rituals</p>
                  <p className="mt-1 text-sm text-muted-foreground">{culture.sampleRituals.join(', ')}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {matchesSection("notification settings admin inbox booking alerts kyc alerts referral alerts daily digest") ? (
          <Card className="scroll-mt-28 rounded-[28px] border-border/80 bg-white" id="notifications">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Notification settings</CardTitle>
              <CardDescription>Admin controls which operational events land in the inbox and digest.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={saveNotificationSettings} className="space-y-3">
                {[
                  ["adminInboxEnabled", "Admin inbox enabled", "Enable the top-right notification inbox icon for operators."],
                  ["registrationAlertsEnabled", "Registration alerts", "Notify admin when a new priest or user registration is submitted."],
                  ["bookingAlertsEnabled", "Booking alerts", "Notify admin for confirmations, failures, replacement risks, and timing issues."],
                  ["kycAlertsEnabled", "KYC alerts", "Notify admin when new priest documents or verification tasks require review."],
                  ["referralAlertsEnabled", "Referral alerts", "Notify admin when referral rewards become eligible for settlement."],
                  ["dailyDigestEnabled", "Daily digest", "Keep a daily summary for bookings, KYC queue, and trust operations."]
                ].map(([name, label, detail]) => (
                  <label className="flex items-start gap-3 rounded-[22px] border border-border bg-white p-4" key={name}>
                    <input className={checkboxClassName} defaultChecked={Boolean(settings.notificationSettings[name as keyof typeof settings.notificationSettings])} name={name} type="checkbox" />
                    <span>
                      <span className="block text-sm font-semibold text-foreground">{label}</span>
                      <span className="block text-sm leading-6 text-muted-foreground">{detail}</span>
                    </span>
                  </label>
                ))}
                <div className="rounded-[22px] border border-border bg-secondary/20 px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">Current unread notifications</p>
                  <p className="mt-1 text-sm text-muted-foreground">Current unread count: {notificationCount}.</p>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="secondary">Save notification settings</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {matchesSection("service tier model audit log") ? (
          <div className="space-y-5">
            <Card className="rounded-[28px] border-border/80 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Official 4-tier service model</CardTitle>
                <CardDescription>The tier model stays visible while rituals and pricing remain culture-aware.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {settings.serviceTiers.map((tier) => (
                  <div className="rounded-[22px] border border-border bg-white p-4" key={tier.name}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">{tier.name}</p>
                      <Badge variant={tier.status === 'active' ? 'success' : 'secondary'}>{tier.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{tier.focus}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-border/80 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Settings audit log</CardTitle>
                <CardDescription>Recent super-admin setting changes for operational traceability.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
          </div>
        ) : null}
      </div>
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

type SelectFieldProps = {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
};

function SelectField({ label, name, defaultValue, options }: SelectFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span>{label}</span>
      <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue={defaultValue} name={name}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

type TextAreaFieldProps = {
  label: string;
  name: string;
  defaultValue: string;
};

function TextAreaField({ label, name, defaultValue }: TextAreaFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span>{label}</span>
      <textarea className="min-h-24 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue={defaultValue} name={name} />
    </label>
  );
}


