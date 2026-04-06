import type { Route } from "next";
import Link from "next/link";
import { Building2, CalendarClock, PlusCircle, Search, ShieldCheck, TimerReset } from "lucide-react";
import { createSubscriptionRecord } from "../../actions/subscriptions";
import { AdminShell } from "../../../components/admin-shell";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { FormActions } from "../../../components/ui/form-actions";
import { Input } from "../../../components/ui/input";
import { getAdminShellData } from "../../../lib/admin-shell-data";
import { requireAdminUser } from "../../../lib/auth";
import { getSubscriptionMetrics, getSubscriptionStore } from "../../../lib/subscription-store";

export const dynamic = "force-dynamic";

type SubscriptionsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const messageMap: Record<string, string> = {
  subscription_saved: "Subscription contract updated and stored for local UAT.",
  subscription_created: "Subscription contract created and added to the queue."
};

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function getVariant(status: string) {
  if (status === "active") {
    return "success" as const;
  }
  if (status === "paused" || status === "cancelled") {
    return "secondary" as const;
  }
  return "outline" as const;
}

export default async function SubscriptionsPage({ searchParams }: SubscriptionsPageProps) {
  const user = await requireAdminUser();
  const { notifications, notificationCount, notificationEnabled } = await getAdminShellData();
  const store = await getSubscriptionStore();
  const metrics = getSubscriptionMetrics(store);
  const resolvedSearchParams = (await searchParams) ?? {};
  const messageKey = readParam(resolvedSearchParams, "message");
  const bannerMessage = messageKey ? messageMap[messageKey] ?? null : null;
  const query = readParam(resolvedSearchParams, "q")?.toLowerCase() ?? "";
  const entityFilter = readParam(resolvedSearchParams, "entity") ?? "all";
  const statusFilter = readParam(resolvedSearchParams, "status") ?? "all";

  const filteredSubscriptions = store.subscriptions.filter((entry) => {
    const matchesQuery =
      !query ||
      [entry.entityName, entry.ritual, entry.priestName, entry.district, entry.locality]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesEntity = entityFilter === "all" || entry.entityType === entityFilter;
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
    return matchesQuery && matchesEntity && matchesStatus;
  });

  return (
    <AdminShell
      active="subscriptions"
      notificationCount={notificationCount}
      notificationEnabled={notificationEnabled}
      notifications={notifications}
      subtitle="Institutional contract console for temple, office, and factory subscriptions. Generated bookings remain visible so priest calendars stay pre-blocked."
      title="Subscriptions"
      userEmail={user.email}
    >
      {bannerMessage ? (
        <div className="rounded-[24px] border border-success/20 bg-success/10 px-4 py-3 text-sm font-medium text-success">{bannerMessage}</div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total contracts", value: metrics.totalContracts, icon: Building2 },
          { label: "Active", value: metrics.activeContracts, icon: ShieldCheck },
          { label: "Paused", value: metrics.pausedContracts, icon: TimerReset },
          { label: "Generated bookings", value: metrics.generatedBookings, icon: CalendarClock }
        ].map((metric) => {
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

      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Create subscription contract</CardTitle>
              <CardDescription>Create recurring temple, office, or factory coverage and prepare pre-blocked booking generation.</CardDescription>
            </div>
            <PlusCircle className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <form action={createSubscriptionRecord} className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            <Input className="h-11 rounded-lg" name="entityName" placeholder="Entity name" required />
            <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground" defaultValue="temple" name="entityType">
              <option value="temple">temple</option>
              <option value="office">office</option>
              <option value="factory">factory</option>
            </select>
            <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground" defaultValue="Bengali" name="cultureType">
              <option value="Bengali">Bengali</option>
              <option value="North_Indian">North Indian</option>
              <option value="Marwadi">Marwadi</option>
              <option value="Odia">Odia</option>
              <option value="Gujarati">Gujarati</option>
            </select>
            <Input className="h-11 rounded-lg" name="district" placeholder="District" required />
            <Input className="h-11 rounded-lg" name="locality" placeholder="Locality" required />
            <Input className="h-11 rounded-lg" name="ritual" placeholder="Ritual / contract type" required />
            <Input className="h-11 rounded-lg" name="priestName" placeholder="Priest name" />
            <Input className="h-11 rounded-lg" name="priestId" placeholder="Priest id" />
            <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground" defaultValue="monthly" name="frequency">
              <option value="daily">daily</option>
              <option value="weekly">weekly</option>
              <option value="monthly">monthly</option>
            </select>
            <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground" defaultValue="3" name="durationMonths">
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
            </select>
            <Input className="h-11 rounded-lg" name="startsOn" type="date" />
            <textarea className="min-h-24 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground xl:col-span-3" name="notes" placeholder="Contract note" />
            <FormActions className="lg:col-span-2 xl:col-span-3">
              <Button type="submit">Create subscription</Button>
            </FormActions>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-lg">Institutional contract queue</CardTitle>
            <CardDescription>Open a contract to manage duration, frequency, and generated booking blocks.</CardDescription>
          </div>
          <form className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_0.9fr_0.9fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-11 rounded-lg pl-9" defaultValue={query} name="q" placeholder="Search entity, ritual, priest..." />
            </label>
            <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground" defaultValue={entityFilter} name="entity">
              <option value="all">All entity types</option>
              <option value="temple">temple</option>
              <option value="office">office</option>
              <option value="factory">factory</option>
            </select>
            <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground" defaultValue={statusFilter} name="status">
              <option value="all">All status</option>
              <option value="draft">draft</option>
              <option value="active">active</option>
              <option value="paused">paused</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
            <Button className="h-11 rounded-lg" type="submit">Apply</Button>
          </form>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3 p-4 xl:hidden">
            {filteredSubscriptions.length ? filteredSubscriptions.map((entry) => (
              <Link
                className="block rounded-[24px] border border-border bg-white p-4 transition-colors hover:bg-secondary/35"
                href={`/dashboard/subscriptions/${entry.id}` as Route}
                key={entry.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{entry.entityName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{entry.entityType} | {entry.locality}</p>
                  </div>
                  <Badge variant={getVariant(entry.status)}>{entry.status}</Badge>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <p className="text-foreground">{entry.ritual}</p>
                  <p className="text-muted-foreground">{entry.priestName}</p>
                  <p className="text-muted-foreground">{entry.frequency} | {entry.durationMonths} months</p>
                </div>
              </Link>
            )) : (
              <div className="rounded-[24px] border border-border bg-white px-4 py-10 text-center text-sm text-muted-foreground">No subscriptions match the current filters.</div>
            )}
          </div>
          <div className="hidden overflow-x-auto xl:block">
          <div className="min-w-[1100px]">
            <div className="grid grid-cols-[1.2fr_1fr_0.85fr_0.8fr_0.9fr_0.7fr] gap-3 border-b border-border px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              <span>Entity</span>
              <span>Ritual / priest</span>
              <span>Frequency</span>
              <span>Duration</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>
            {filteredSubscriptions.length ? filteredSubscriptions.map((entry) => (
              <Link className="grid grid-cols-[1.2fr_1fr_0.85fr_0.8fr_0.9fr_0.7fr] gap-3 border-b border-border px-5 py-4 transition-colors hover:bg-secondary/35" href={`/dashboard/subscriptions/${entry.id}` as Route} key={entry.id}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{entry.entityName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{entry.entityType} | {entry.locality}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{entry.ritual}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{entry.priestName}</p>
                </div>
                <div className="text-sm text-foreground">{entry.frequency}</div>
                <div className="text-sm text-foreground">{entry.durationMonths} months</div>
                <div><Badge variant={getVariant(entry.status)}>{entry.status}</Badge></div>
                <div className="flex justify-end"><span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground">Open</span></div>
              </Link>
            )) : (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">No subscriptions match the current filters.</div>
            )}
          </div>
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
