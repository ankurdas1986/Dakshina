import Link from "next/link";
import { ChevronLeft, MapPinned, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminShell } from "../../../../components/admin-shell";
import { PriestDetailPanel, getPriestStatusVariant } from "../../../../components/priests/priest-detail-panel";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { getAdminShellData } from "../../../../lib/admin-shell-data";
import { requireAdminUser } from "../../../../lib/auth";
import { getPriestStore } from "../../../../lib/priest-store";
import { buildCategoryLabel, getRitualStore } from "../../../../lib/ritual-store";

export const dynamic = "force-dynamic";

type PriestDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

const messageMap: Record<string, string> = {
  priest_review_saved: "Priest review updated and stored for local UAT."
};

export default async function PriestDetailPage({ params, searchParams }: PriestDetailPageProps) {
  const user = await requireAdminUser();
  const { notifications, notificationCount, notificationEnabled } = await getAdminShellData();
  const { id } = await params;
  const store = await getPriestStore();
  const ritualStore = await getRitualStore();
  const priest = store.priests.find((item) => item.id === id);

  if (!priest) {
    notFound();
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const messageKey = readParam(resolvedSearchParams, "message");
  const bannerMessage = messageKey ? messageMap[messageKey] ?? null : null;
  const categoryPath = priest.serviceCategoryId
    ? buildCategoryLabel(priest.serviceCategoryId, ritualStore.categories)
    : "Not assigned";

  return (
    <AdminShell
      active="priests"
      notificationCount={notificationCount}
      notificationEnabled={notificationEnabled}
      notifications={notifications}
      breadcrumbs={
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link className="inline-flex items-center gap-2 font-medium text-foreground hover:text-primary" href="/dashboard/priests">
            <ChevronLeft className="h-4 w-4" />
            Back to priest queue
          </Link>
          <span>/</span>
          <span>{priest.name}</span>
        </div>
      }
      subtitle="Dedicated review page for KYC validation, service mapping, and district readiness. The queue stays clean while the full workflow lives here."
      title="Priest Review"
      userEmail={user.email}
      subnav={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={getPriestStatusVariant(priest.kycStatus)}>KYC {priest.kycStatus}</Badge>
          <Badge variant={getPriestStatusVariant(priest.verificationStatus)}>{priest.verificationStatus}</Badge>
          <Badge variant="outline">{categoryPath}</Badge>
        </div>
      }
    >
      {bannerMessage ? (
        <div className="rounded-[24px] border border-success/20 bg-success/10 px-4 py-3 text-sm font-medium text-success">
          {bannerMessage}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Operational summary</CardTitle>
            <CardDescription>Use this snapshot before changing KYC or priest coverage settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] border border-border bg-secondary/30 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Coverage</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{priest.locality}, {priest.district}</p>
              <p className="mt-1 text-sm text-muted-foreground">Travel radius {priest.radiusKm} km</p>
            </div>
            <div className="rounded-[24px] border border-border bg-secondary/30 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Assigned path</p>
              <p className="mt-2 text-base font-semibold text-foreground">{categoryPath}</p>
              <p className="mt-1 text-sm text-muted-foreground">{priest.services.length} services selected</p>
            </div>
            <div className="rounded-[24px] border border-border bg-secondary/30 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">KYC checkpoint</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">Review documents, verify coverage, then approve or reject. Notes remain attached to this priest record.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] border border-border bg-secondary/30 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MapPinned className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">District readiness</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">This detail page is now the single workspace for district fit, ritual coverage, and service radius decisions.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Detail workspace</CardTitle>
            <CardDescription>All operational edits for this priest live here.</CardDescription>
          </CardHeader>
          <CardContent className="surface-scroll overflow-y-auto pr-2 xl:max-h-[980px]">
            <PriestDetailPanel priest={priest} returnTo={`/dashboard/priests/${priest.id}`} ritualStore={ritualStore} />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
