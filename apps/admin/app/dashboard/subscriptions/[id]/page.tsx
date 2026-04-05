import type { Route } from "next";
import Link from "next/link";
import { Building2, ChevronLeft, Wallet } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminShell } from "../../../../components/admin-shell";
import { SubscriptionDetailPanel, getSubscriptionVariant } from "../../../../components/subscriptions/subscription-detail-panel";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { getAdminShellData } from "../../../../lib/admin-shell-data";
import { requireAdminUser } from "../../../../lib/auth";
import { getSubscriptionStore } from "../../../../lib/subscription-store";

export const dynamic = "force-dynamic";

type SubscriptionDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

const messageMap: Record<string, string> = {
  subscription_saved: "Subscription contract updated and stored for local UAT."
};

export default async function SubscriptionDetailPage({ params, searchParams }: SubscriptionDetailPageProps) {
  const user = await requireAdminUser();
  const { notifications, notificationCount, notificationEnabled } = await getAdminShellData();
  const { id } = await params;
  const store = await getSubscriptionStore();
  const record = store.subscriptions.find((entry) => entry.id === id);

  if (!record) {
    notFound();
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const messageKey = readParam(resolvedSearchParams, "message");
  const bannerMessage = messageKey ? messageMap[messageKey] ?? null : null;

  return (
    <AdminShell
      active="subscriptions"
      notificationCount={notificationCount}
      notificationEnabled={notificationEnabled}
      notifications={notifications}
      breadcrumbs={
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link className="inline-flex items-center gap-2 font-medium text-foreground hover:text-primary" href={"/dashboard/subscriptions" as Route}>
            <ChevronLeft className="h-4 w-4" />
            Back to subscriptions
          </Link>
          <span>/</span>
          <span>{record.entityName}</span>
        </div>
      }
      subtitle="Use this contract page to maintain recurring frequency, duration, and generated bookings without cluttering the queue."
      title="Subscription Contract"
      userEmail={user.email}
      subnav={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={getSubscriptionVariant(record.status)}>{record.status}</Badge>
          <Badge variant="outline">{record.frequency}</Badge>
          <Badge variant="outline">{record.durationMonths} months</Badge>
        </div>
      }
    >
      {bannerMessage ? (
        <div className="rounded-[24px] border border-success/20 bg-success/10 px-4 py-3 text-sm font-medium text-success">{bannerMessage}</div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Operational summary</CardTitle>
            <CardDescription>Contract visibility for institutional recurring coverage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] border border-border bg-secondary/30 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Entity</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{record.entityName}</p>
              <p className="mt-1 text-sm text-muted-foreground">{record.entityType} | {record.district}</p>
            </div>
            <div className="rounded-[24px] border border-border bg-secondary/30 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Contract rhythm</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{record.frequency} recurrence for {record.durationMonths} months. Bookings should be generated early enough to pre-block priest availability.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] border border-border bg-secondary/30 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Wallet className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Operational impact</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{record.generatedBookingCodes.length} generated bookings are currently linked to this contract.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Detail workspace</CardTitle>
            <CardDescription>All recurring contract edits for this institutional customer live here.</CardDescription>
          </CardHeader>
          <CardContent className="surface-scroll overflow-y-auto pr-2 xl:max-h-[980px]">
            <SubscriptionDetailPanel entry={record} returnTo={`/dashboard/subscriptions/${record.id}`} />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
