import type { Route } from "next";
import Link from "next/link";
import { ChevronRight, FileJson2, FolderTree, Globe2, Layers3, ScrollText } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { RitualPageShell } from "../../../components/rituals/ritual-page-shell";
import { getBookingStore } from "../../../lib/booking-store";
import {
  getRitualMetrics,
  getRitualStore,
  getTopDemandRituals
} from "../../../lib/ritual-store";

export const dynamic = "force-dynamic";

function formatCulture(value: string) {
  return value.replace("_", " ");
}

export default async function RitualsOverviewPage() {
  const store = await getRitualStore();
  const bookingStore = await getBookingStore();
  const metrics = getRitualMetrics(store);
  const topDemand = getTopDemandRituals(store).slice(0, 8);

  const metricCards = [
    { label: "Service tiers", value: metrics.serviceTiers, icon: Layers3 },
    { label: "Cultures covered", value: metrics.culturesCovered, icon: Globe2 },
    { label: "Category tree nodes", value: metrics.categoryCount, icon: FolderTree },
    { label: "Ritual templates", value: metrics.ritualCount, icon: ScrollText },
    { label: "Fard templates", value: metrics.fardTemplates, icon: FileJson2 }
  ];

  const quickLinks = [
    {
      title: "Category tree",
      detail: "Manage culture hierarchy, node types, tier mapping, and dependency-safe deletes.",
      href: "/dashboard/rituals/categories" as Route
    },
    {
      title: "Ritual library",
      detail: "Edit ritual templates, pricing splits, demand rank, and delivery/Fard mode.",
      href: "/dashboard/rituals/library" as Route
    },
    {
      title: "Create",
      detail: "Create new category nodes and ritual templates in dedicated forms.",
      href: "/dashboard/rituals/create" as Route
    },
    {
      title: "Panjika",
      detail: "Review culture research sources and the Smart Panjika import workspace.",
      href: "/dashboard/rituals/panjika" as Route
    },
    {
      title: "Fard",
      detail: "Review Fard operating rules and locked booking snapshots.",
      href: "/dashboard/rituals/fard" as Route
    }
  ];

  return (
    <RitualPageShell
      activeHref="/dashboard/rituals"
      subtitle="Use the overview as a route map. Create, manage hierarchy, and edit ritual templates in dedicated ritual workspaces."
      title="Rituals and Fard"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metricCards.map((metric) => {
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

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Ritual workspaces</CardTitle>
            <CardDescription>The module is split so create, edit, research, and snapshot review are no longer mixed on one page.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {quickLinks.map((link) => (
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
            <CardTitle className="text-lg">Top demand rituals by culture</CardTitle>
            <CardDescription>Bengali remains homepage priority while other traditions stay ready for phased rollout.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {topDemand.map((ritual) => (
              <div className="rounded-[22px] border border-border bg-white p-4" key={ritual.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{ritual.name}</p>
                  <Badge variant={ritual.cultureType === "Bengali" ? "success" : "outline"}>{formatCulture(ritual.cultureType)}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{ritual.demandLabel}</p>
                <p className="mt-2 text-xs text-muted-foreground">Homepage rank {ritual.homepageRank ?? "-"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Culture research snapshot</CardTitle>
            <CardDescription>Tradition source research stays visible here without crowding the editing workflows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {store.panjikaResearch.map((entry) => (
              <div className="rounded-[22px] border border-border bg-white p-4" key={entry.cultureType}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{formatCulture(entry.cultureType)}</p>
                  <Badge variant={entry.cultureType === "Bengali" ? "success" : "outline"}>{entry.sources[0]}</Badge>
                </div>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Sources</p>
                <p className="mt-1 text-sm text-foreground">{entry.sources.join(" / ")}</p>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Sample rituals</p>
                <p className="mt-1 text-sm text-muted-foreground">{entry.sampleRituals.join(", ")}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Fard snapshot integrity</CardTitle>
            <CardDescription>Confirmed bookings carry locked Fard data even if the ritual template changes later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookingStore.cases.slice(0, 3).map((booking) => (
              <div className="rounded-[22px] border border-border bg-white p-4" key={booking.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{booking.bookingCode} - {booking.ritual}</p>
                  <Badge variant="outline">{booking.fardSnapshot.deliveryMode}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Locked at {booking.fardSnapshotLockedAt || "booking confirmation"}</p>
                <p className="mt-2 text-xs text-muted-foreground">Items: {booking.fardSnapshot.items.length}</p>
              </div>
            ))}
            <div className="flex justify-end">
              <Button asChild>
                <Link href={"/dashboard/rituals/fard" as Route}>Open Fard workspace</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RitualPageShell>
  );
}
