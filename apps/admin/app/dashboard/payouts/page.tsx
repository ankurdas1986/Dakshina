import Link from "next/link";
import { Landmark, Search, Wallet, WalletCards } from "lucide-react";
import { AdminShell } from "../../../components/admin-shell";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { getPayoutVariant } from "../../../components/payouts/payout-detail-panel";
import { getAdminShellData } from "../../../lib/admin-shell-data";
import { requireAdminUser } from "../../../lib/auth";
import { getPayoutMetrics, getPayoutStore } from "../../../lib/payout-store";

export const dynamic = "force-dynamic";

type PayoutsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const messageMap: Record<string, string> = {
  payout_saved: "Payout entry updated and stored for local UAT.",
  payout_confirmed: "Manual payout confirmed and the settlement was written to the local ledger."
};

const errorMap: Record<string, string> = {
  missing_payout_id: "Payout id is missing.",
  invalid_payout_id: "Payout id is invalid."
};

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function PayoutsPage({ searchParams }: PayoutsPageProps) {
  const user = await requireAdminUser();
  const { notifications, notificationCount, notificationEnabled } = await getAdminShellData();
  const store = await getPayoutStore();
  const metrics = getPayoutMetrics(store);
  const resolvedSearchParams = (await searchParams) ?? {};
  const messageKey = readParam(resolvedSearchParams, "message");
  const errorKey = readParam(resolvedSearchParams, "error");
  const query = readParam(resolvedSearchParams, "q")?.toLowerCase() ?? "";
  const statusFilter = readParam(resolvedSearchParams, "status") ?? "all";
  const bannerMessage = messageKey ? messageMap[messageKey] ?? null : null;
  const bannerError = errorKey ? errorMap[errorKey] ?? errorKey : null;

  const filteredEntries = store.entries.filter((entry) => {
    const matchesQuery =
      !query ||
      [entry.bookingCode, entry.ritual, entry.priest, entry.district, entry.payoutDetails.upiId]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const metricCards = [
    { label: "Total payouts", value: metrics.totalEntries, icon: WalletCards },
    { label: "Pending", value: metrics.pendingCount, icon: Wallet },
    { label: "Scheduled", value: metrics.scheduledCount, icon: Landmark },
    { label: "Paid", value: metrics.paidCount, icon: Wallet }
  ];

  return (
    <AdminShell
      active="payouts"
      notificationCount={notificationCount}
      notificationEnabled={notificationEnabled}
      notifications={notifications}
      subtitle="Manual-first payout console for completed rituals. Admin reviews payout-ready bookings, verifies UPI details, and marks settlements after transfer."
      title="Payout Management"
      userEmail={user.email}
      subnav={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">Manual UPI payouts</Badge>
          <Badge variant="outline">Completed rituals</Badge>
          <Badge variant="outline">Settlement status</Badge>
        </div>
      }
    >
      {bannerMessage ? (
        <div className="rounded-[24px] border border-success/20 bg-success/10 px-4 py-3 text-sm font-medium text-success">
          {bannerMessage}
        </div>
      ) : null}
      {bannerError ? (
        <div className="rounded-[24px] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {bannerError}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-lg">Payout queue</CardTitle>
            <CardDescription>Review completed rituals, confirm payout details, then open one payout record to settle it.</CardDescription>
          </div>
          <form className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_0.9fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-11 rounded-[22px] pl-9" defaultValue={query} name="q" placeholder="Search payout, priest, UPI, district..." />
            </label>
            <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground" defaultValue={statusFilter} name="status">
              <option value="all">All statuses</option>
              <option value="pending">pending</option>
              <option value="scheduled">scheduled</option>
              <option value="paid">paid</option>
              <option value="failed">failed</option>
            </select>
            <Button className="h-11 rounded-[22px]" type="submit">Apply</Button>
          </form>
        </CardHeader>
        <CardContent className="surface-scroll overflow-x-auto overflow-y-auto p-0 xl:max-h-[860px]">
          <div className="min-w-[940px]">
            <div className="grid grid-cols-[1.15fr_1.1fr_0.8fr_0.8fr_0.8fr_0.8fr_0.7fr] gap-3 border-b border-border px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              <span>Booking</span>
              <span>Priest</span>
              <span>District</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Scheduled</span>
              <span className="text-right">Action</span>
            </div>
            {filteredEntries.length ? filteredEntries.map((entry) => (
              <Link
                className="grid grid-cols-[1.15fr_1.1fr_0.8fr_0.8fr_0.8fr_0.8fr_0.7fr] gap-3 border-b border-border px-5 py-4 transition-colors hover:bg-secondary/35"
                href={`/dashboard/payouts/${entry.id}`}
                key={entry.id}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{entry.bookingCode} - {entry.ritual}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{entry.completedAt}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{entry.priest}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{entry.payoutDetails.upiId}</p>
                </div>
                <p className="text-sm text-foreground">{entry.district}</p>
                <p className="text-sm text-foreground">Rs {entry.payoutAmount}</p>
                <div className="flex items-start"><Badge variant={getPayoutVariant(entry.status)}>{entry.status}</Badge></div>
                <p className="text-sm text-foreground">{entry.payoutScheduledFor}</p>
                <div className="flex justify-end"><span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground">Open</span></div>
              </Link>
            )) : (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">No payouts match the current filters.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}

