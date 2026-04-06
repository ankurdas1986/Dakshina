import type { Route } from "next";
import Link from "next/link";
import { BellDot, CalendarRange, ChevronRight, ShieldCheck, Sparkles } from "lucide-react";
import { AdminShell } from "../../components/admin-shell";
import { SettingsRouteNav } from "../../components/settings/settings-route-nav";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { getAdminShellData } from "../../lib/admin-shell-data";
import { moduleStatus } from "../../lib/admin-data";
import { requireAdminUser } from "../../lib/auth";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireAdminUser();
  const { notifications, notificationCount, notificationEnabled, settings } = await getAdminShellData();
  const resolvedSearchParams = (await searchParams) ?? {};
  const query = readParam(resolvedSearchParams, "q")?.toLowerCase() ?? "";
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

  const quickLinks = [
    {
      title: "Culture rollout",
      detail: "Default culture, launch cluster, and Panjika-backed culture readiness.",
      href: "/dashboard/settings/culture" as Route
    },
    {
      title: "Commercial rules",
      detail: "Commission, advance payment, referral percentages, and booking-window economics.",
      href: "/dashboard/settings/commercial" as Route
    },
    {
      title: "Governance",
      detail: "Operational toggles for festival blocking, overrides, OTP, KYC, and review controls.",
      href: "/dashboard/settings/governance" as Route
    },
    {
      title: "District overrides",
      detail: "District-level commission, travel fees, and service cluster overrides.",
      href: "/dashboard/settings/districts" as Route
    },
    {
      title: "Notifications",
      detail: "Inbox alert scope, registration alerts, and daily digest controls.",
      href: "/dashboard/settings/notifications" as Route
    }
  ];

  return (
    <AdminShell
      active="settings"
      notificationCount={notificationCount}
      notificationEnabled={notificationEnabled}
      notifications={notifications}
      subtitle="Use this overview as the control map. Edit each settings group in its own workspace instead of one long form."
      title="Global Settings"
      userEmail={user.email}
      subnav={<SettingsRouteNav activeHref="/dashboard" />}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {launchMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card className="rounded-[24px] border-border/80 bg-white" key={metric.label}>
              <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-extrabold tracking-tight text-foreground">{metric.value}</p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-2.5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{metric.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Settings workspaces</CardTitle>
            <CardDescription>Each settings group now has a dedicated route to reduce form density and operator confusion.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {quickLinks.filter((link) => matchesSection(`${link.title} ${link.detail}`)).map((link) => (
              <Link className="group rounded-[22px] border border-border bg-white p-4 transition-colors hover:bg-secondary/30" href={link.href} key={link.href}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{link.title}</p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{link.detail}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Admin module map</CardTitle>
            <CardDescription>The admin remains split into focused modules with clear ownership.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
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

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Culture and Panjika research</CardTitle>
            <CardDescription>Bengali remains first, but every supported tradition is seeded and governable.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {settings.cultureResearch.filter((culture) => matchesSection(`${culture.cultureType} ${culture.sources.join(" ")} ${culture.sampleRituals.join(" ")}`)).map((culture) => (
              <div className="rounded-[22px] border border-border bg-white p-4" key={culture.cultureType}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{culture.cultureType.replace("_", " ")}</p>
                  <Badge variant={culture.isLaunchPriority ? "success" : "outline"}>{culture.isLaunchPriority ? "Launch priority" : "Supported"}</Badge>
                </div>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Sources</p>
                <p className="mt-1 text-sm text-foreground">{culture.sources.join(" / ")}</p>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Sample rituals</p>
                <p className="mt-1 text-sm text-muted-foreground">{culture.sampleRituals.join(", ")}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Service tiers and audit log</CardTitle>
            <CardDescription>Reference-only visibility stays here; edits happen in dedicated settings and ritual workspaces.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {settings.serviceTiers.map((tier) => (
              <div className="rounded-[22px] border border-border bg-white p-4" key={tier.name}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{tier.name}</p>
                  <Badge variant={tier.status === "active" ? "success" : "secondary"}>{tier.status}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{tier.focus}</p>
              </div>
            ))}
            <div className="rounded-[22px] border border-border bg-secondary/20 p-4">
              <p className="text-sm font-semibold text-foreground">Latest audit event</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{settings.auditLog[0]?.detail ?? "No audit events yet."}</p>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{settings.auditLog[0]?.action ?? "Pending"}</span>
                <span>{settings.auditLog[0]?.createdAt ?? "-"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button asChild>
          <Link href={"/dashboard/settings/commercial" as Route}>Open settings workspace</Link>
        </Button>
      </div>
    </AdminShell>
  );
}
