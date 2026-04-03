import Link from "next/link";
import { ChevronLeft, Landmark, Wallet } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminShell } from "../../../../components/admin-shell";
import { PayoutDetailPanel, getPayoutVariant } from "../../../../components/payouts/payout-detail-panel";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { getAdminShellData } from "../../../../lib/admin-shell-data";
import { requireAdminUser } from "../../../../lib/auth";
import { getPayoutStore } from "../../../../lib/payout-store";

export const dynamic = "force-dynamic";

type PayoutDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const messageMap: Record<string, string> = {
  payout_saved: "Payout entry updated and stored for local UAT."
};

const errorMap: Record<string, string> = {
  missing_payout_id: "Payout id is missing.",
  invalid_payout_id: "Payout id is invalid."
};

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function PayoutDetailPage({ params, searchParams }: PayoutDetailPageProps) {
  const user = await requireAdminUser();
  const { notifications, notificationCount, notificationEnabled } = await getAdminShellData();
  const { id } = await params;
  const store = await getPayoutStore();
  const entry = store.entries.find((item) => item.id === id);

  if (!entry) {
    notFound();
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const messageKey = readParam(resolvedSearchParams, "message");
  const errorKey = readParam(resolvedSearchParams, "error");
  const bannerMessage = messageKey ? messageMap[messageKey] ?? null : null;
  const bannerError = errorKey ? errorMap[errorKey] ?? errorKey : null;

  return (
    <AdminShell
      active="payouts"
      notificationCount={notificationCount}
      notificationEnabled={notificationEnabled}
      notifications={notifications}
      breadcrumbs={
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link className="inline-flex items-center gap-2 font-medium text-foreground hover:text-primary" href="/dashboard/payouts">
            <ChevronLeft className="h-4 w-4" />
            Back to payout queue
          </Link>
          <span>/</span>
          <span>{entry.bookingCode}</span>
        </div>
      }
      subtitle="Settlement workspace for manual-first MVP payouts. Verify the UPI account, amount, and admin reference before marking a case paid."
      title="Payout Detail"
      userEmail={user.email}
      subnav={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={getPayoutVariant(entry.status)}>{entry.status}</Badge>
          <Badge variant="outline">Rs {entry.payoutAmount}</Badge>
          <Badge variant="outline">{entry.payoutDetails.upiId}</Badge>
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

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Settlement summary</CardTitle>
            <CardDescription>Use this summary to validate the payout before releasing manual transfer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] border border-border bg-secondary/30 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Booking</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{entry.bookingCode} - {entry.ritual}</p>
              <p className="mt-1 text-sm text-muted-foreground">{entry.priest} | {entry.district}</p>
            </div>
            <div className="rounded-[24px] border border-border bg-secondary/30 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Wallet className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Manual payout mode</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">All payments land with admin in MVP. This queue is the settlement ledger before future payout automation.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] border border-border bg-secondary/30 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Landmark className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Settlement details</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">UPI ID {entry.payoutDetails.upiId}. Scheduled for {entry.payoutScheduledFor}. Mark paid only after transfer confirmation.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Detail workspace</CardTitle>
            <CardDescription>All payout state changes for this entry live here.</CardDescription>
          </CardHeader>
          <CardContent className="surface-scroll overflow-y-auto pr-2 xl:max-h-[980px]">
            <PayoutDetailPanel entry={entry} returnTo={`/dashboard/payouts/${entry.id}`} />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
