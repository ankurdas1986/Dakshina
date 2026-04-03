import Link from "next/link";
import { BadgeCheck, FileCheck2, MapPinned, Search, Users } from "lucide-react";
import { AdminShell } from "../../../components/admin-shell";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { getAdminShellData } from "../../../lib/admin-shell-data";
import { requireAdminUser } from "../../../lib/auth";
import { getPriestMetrics, getPriestStore } from "../../../lib/priest-store";
import { buildCategoryLabel, getRitualStore } from "../../../lib/ritual-store";
import { getPriestStatusVariant } from "../../../components/priests/priest-detail-panel";

export const dynamic = "force-dynamic";

type PriestsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const messageMap: Record<string, string> = {
  priest_review_saved: "Priest review updated and stored for local UAT."
};

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function PriestsPage({ searchParams }: PriestsPageProps) {
  const user = await requireAdminUser();
  const { notifications, notificationCount, notificationEnabled } = await getAdminShellData();
  const store = await getPriestStore();
  const ritualStore = await getRitualStore();
  const metricsSnapshot = getPriestMetrics(store);
  const resolvedSearchParams = (await searchParams) ?? {};
  const messageKey = readParam(resolvedSearchParams, "message");
  const bannerMessage = messageKey ? messageMap[messageKey] ?? null : null;
  const query = readParam(resolvedSearchParams, "q")?.toLowerCase() ?? "";
  const districtFilter = readParam(resolvedSearchParams, "district") ?? "all";
  const kycFilter = readParam(resolvedSearchParams, "kyc") ?? "all";
  const verificationFilter = readParam(resolvedSearchParams, "verification") ?? "all";

  const districts = [...new Set(store.priests.map((priest) => priest.district))].sort();
  const districtSummaries = districts.map((district) => {
    const priestsInDistrict = store.priests.filter((priest) => priest.district === district);
    const verified = priestsInDistrict.filter((priest) => priest.verificationStatus === "verified").length;
    const averageRadius = Math.round(
      priestsInDistrict.reduce((total, priest) => total + priest.radiusKm, 0) / priestsInDistrict.length
    );

    return {
      district,
      priests: priestsInDistrict.length,
      verified,
      averageRadius
    };
  });
  const filteredPriests = store.priests.filter((priest) => {
    const matchesQuery =
      !query ||
      [
        priest.name,
        priest.locality,
        priest.district,
        priest.services.join(" "),
        priest.phone
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesDistrict = districtFilter === "all" || priest.district === districtFilter;
    const matchesKyc = kycFilter === "all" || priest.kycStatus === kycFilter;
    const matchesVerification =
      verificationFilter === "all" || priest.verificationStatus === verificationFilter;

    return matchesQuery && matchesDistrict && matchesKyc && matchesVerification;
  });

  const metrics = [
    { label: "Total priests", value: metricsSnapshot.totalPriests, icon: Users },
    { label: "Verified", value: metricsSnapshot.verifiedPriests, icon: BadgeCheck },
    { label: "Pending KYC", value: metricsSnapshot.pendingKyc, icon: FileCheck2 },
    { label: "Districts covered", value: metricsSnapshot.districtsCovered, icon: MapPinned }
  ];

  return (
    <AdminShell
      active="priests"
      notificationCount={notificationCount}
      notificationEnabled={notificationEnabled}
      notifications={notifications}
      subtitle="Use the queue to scan KYC state, coverage, and service mapping. Open a priest record to complete the full review workflow in a dedicated detail page."
      title="Priest Management"
      userEmail={user.email}
      subnav={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">Queue view</Badge>
          <Badge variant="outline">Search and filter</Badge>
          <Badge variant="outline">KYC review</Badge>
          <Badge variant="outline">Service mapping</Badge>
        </div>
      }
    >
      {bannerMessage ? (
        <div className="rounded-[24px] border border-success/20 bg-success/10 px-4 py-3 text-sm font-medium text-success">
          {bannerMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
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
          <CardTitle className="text-lg">District and radius coverage</CardTitle>
          <CardDescription>Use this summary to identify where verified priest coverage is thin before opening individual records.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {districtSummaries.map((summary) => (
            <Link
              className="rounded-[24px] border border-border bg-secondary/20 p-4 transition-colors hover:bg-primary/5"
              href={`/dashboard/priests?district=${encodeURIComponent(summary.district)}`}
              key={summary.district}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{summary.district}</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{summary.priests} priests</p>
              <p className="mt-1 text-sm text-muted-foreground">{summary.verified} verified</p>
              <p className="mt-1 text-sm text-muted-foreground">Avg radius {summary.averageRadius} km</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Open district queue</p>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-lg">Priest operations queue</CardTitle>
            <CardDescription>Table-first review flow. Use filters here, then open a single priest record to take action.</CardDescription>
          </div>
          <form className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_0.9fr_0.8fr_0.9fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-11 rounded-[22px] pl-9" defaultValue={query} name="q" placeholder="Search priest, district, service, phone..." />
            </label>
            <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground" defaultValue={districtFilter} name="district">
              <option value="all">All districts</option>
              {districts.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
            <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground" defaultValue={kycFilter} name="kyc">
              <option value="all">All KYC</option>
              <option value="pending">pending</option>
              <option value="review">review</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
            </select>
            <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground" defaultValue={verificationFilter} name="verification">
              <option value="all">All verification</option>
              <option value="unverified">unverified</option>
              <option value="review">review</option>
              <option value="verified">verified</option>
            </select>
            <Button className="h-11 rounded-[22px]" type="submit">Apply</Button>
          </form>
        </CardHeader>
        <CardContent className="surface-scroll overflow-y-auto p-0 xl:max-h-[860px]">
          <div className="min-w-[940px]">
            <div className="grid grid-cols-[1.45fr_1.1fr_0.8fr_0.9fr_0.8fr_0.7fr_0.7fr] gap-3 border-b border-border px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              <span>Priest</span>
              <span>Service path</span>
              <span>KYC</span>
              <span>Verification</span>
              <span>Radius</span>
              <span>Submitted</span>
              <span className="text-right">Action</span>
            </div>
            {filteredPriests.length ? filteredPriests.map((priest) => (
              <Link
                className="grid grid-cols-[1.45fr_1.1fr_0.8fr_0.9fr_0.8fr_0.7fr_0.7fr] gap-3 border-b border-border px-5 py-4 transition-colors hover:bg-secondary/35"
                href={`/dashboard/priests/${priest.id}`}
                key={priest.id}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{priest.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{priest.locality}, {priest.district}</p>
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm text-foreground">
                    {priest.serviceCategoryId ? buildCategoryLabel(priest.serviceCategoryId, ritualStore.categories) : "Not assigned"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{priest.ritualIds.length} rituals</p>
                </div>
                <div className="flex items-start"><Badge variant={getPriestStatusVariant(priest.kycStatus)}>{priest.kycStatus}</Badge></div>
                <div className="flex items-start"><Badge variant={getPriestStatusVariant(priest.verificationStatus)}>{priest.verificationStatus}</Badge></div>
                <p className="text-sm text-foreground">{priest.radiusKm} km</p>
                <p className="text-sm text-foreground">{priest.submittedAt}</p>
                <div className="flex justify-end"><span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground">Open</span></div>
              </Link>
            )) : (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">No priests match the current filters.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}

