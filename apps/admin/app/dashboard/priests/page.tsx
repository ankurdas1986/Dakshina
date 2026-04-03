import Image from "next/image";
import { BadgeCheck, FileCheck2, FileImage, FolderOpenDot, MapPinned, PhoneCall, ScrollText, Users } from "lucide-react";
import { savePriestReview } from "../../actions/priests";
import { AdminShell } from "../../../components/admin-shell";
import { PriestServiceSelector } from "../../../components/priest-service-selector";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { requireAdminUser } from "../../../lib/auth";
import { getPriestMetrics, getPriestStore } from "../../../lib/priest-store";
import { buildCategoryLabel, getRitualStore } from "../../../lib/ritual-store";

export const dynamic = "force-dynamic";

type PriestsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const messageMap: Record<string, string> = {
  priest_review_saved: "Priest review updated and stored for local UAT."
};

const documentPreviewMap: Record<string, { title: string; asset: string }> = {
  govt_id: { title: "Government ID", asset: "/kyc/govt-id.svg" },
  address_proof: { title: "Address proof", asset: "/kyc/address-proof.svg" },
  profile_photo: { title: "Profile photo", asset: "/kyc/profile-photo.svg" },
  service_specialization: { title: "Service specialization", asset: "/kyc/service-specialization.svg" },
  home_pin: { title: "Home pin", asset: "/kyc/home-pin.svg" }
};

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function PriestsPage({ searchParams }: PriestsPageProps) {
  const user = await requireAdminUser();
  const store = await getPriestStore();
  const ritualStore = await getRitualStore();
  const metricsSnapshot = getPriestMetrics(store);
  const resolvedSearchParams = (await searchParams) ?? {};
  const messageKey = readParam(resolvedSearchParams, "message");
  const bannerMessage = messageKey ? messageMap[messageKey] ?? null : null;

  const metrics = [
    { label: "Total priests", value: metricsSnapshot.totalPriests, icon: Users },
    { label: "Verified", value: metricsSnapshot.verifiedPriests, icon: BadgeCheck },
    { label: "Pending KYC", value: metricsSnapshot.pendingKyc, icon: FileCheck2 },
    { label: "Districts covered", value: metricsSnapshot.districtsCovered, icon: MapPinned }
  ];

  return (
    <AdminShell
      active="priests"
      subtitle="Module 2 now handles real onboarding review, manual KYC decisions, verification controls, and cascading ritual selection with persisted local state."
      title="Priest Management"
      userEmail={user.email}
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

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Onboarding and KYC queue</CardTitle>
            <CardDescription>Admin can review each priest, update KYC state, and manage verification readiness.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[720px] space-y-4 overflow-y-auto pr-2 surface-scroll">
            {store.priests.map((priest) => (
              <form action={savePriestReview} className="rounded-[24px] border border-border bg-white p-4" key={priest.id}>
                <input name="id" type="hidden" value={priest.id} />
                <div className="grid gap-5 2xl:grid-cols-[300px_minmax(0,1fr)]">
                  <div className="space-y-3">
                    <div>
                      <p className="text-base font-semibold text-foreground">{priest.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {priest.locality}, {priest.district}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={priest.kycStatus === "approved" ? "success" : priest.kycStatus === "review" ? "outline" : "secondary"}>
                        KYC {priest.kycStatus}
                      </Badge>
                      <Badge variant={priest.verificationStatus === "verified" ? "success" : priest.verificationStatus === "review" ? "outline" : "secondary"}>
                        {priest.verificationStatus}
                      </Badge>
                    </div>
                    <div className="grid gap-2">
                      <InfoRow
                        icon={ScrollText}
                        label="Services"
                        value={priest.services.join(", ")}
                      />
                      <InfoRow
                        icon={FolderOpenDot}
                        label="Category path"
                        value={
                          priest.serviceCategoryId
                            ? buildCategoryLabel(priest.serviceCategoryId, ritualStore.categories)
                            : "Not assigned"
                        }
                      />
                      <InfoRow
                        icon={PhoneCall}
                        label="Contact"
                        value={priest.phone}
                      />
                      <InfoRow
                        icon={MapPinned}
                        label="Submitted"
                        value={priest.submittedAt}
                      />
                    </div>
                    <div className="rounded-[20px] border border-border bg-secondary/35 p-3">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <FileImage className="h-4 w-4 text-primary" />
                        <span>KYC documents</span>
                      </div>
                      <div className="grid gap-3">
                        {priest.documents.map((documentKey) => {
                          const preview = documentPreviewMap[documentKey] ?? {
                            title: documentKey,
                            asset: "/kyc/govt-id.svg"
                          };

                          return (
                            <div className="overflow-hidden rounded-[18px] border border-border bg-white" key={documentKey}>
                              <div className="relative aspect-[16/10] bg-muted">
                                <Image
                                  alt={preview.title}
                                  className="object-cover"
                                  fill
                                  sizes="(max-width: 1280px) 100vw, 240px"
                                  src={preview.asset}
                                />
                              </div>
                              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{preview.title}</p>
                                  <p className="text-xs text-muted-foreground">Preview available for admin review</p>
                                </div>
                                <Button size="sm" type="button" variant="secondary">
                                  View
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      <span>KYC status</span>
                      <select
                        className="h-11 rounded-[22px] border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        defaultValue={priest.kycStatus}
                        name="kycStatus"
                      >
                        <option value="pending">pending</option>
                        <option value="review">review</option>
                        <option value="approved">approved</option>
                        <option value="rejected">rejected</option>
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      <span>Verification status</span>
                      <select
                        className="h-11 rounded-[22px] border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        defaultValue={priest.verificationStatus}
                        name="verificationStatus"
                      >
                        <option value="unverified">unverified</option>
                        <option value="review">review</option>
                        <option value="verified">verified</option>
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-foreground">
                      <span>Travel radius (km)</span>
                      <Input defaultValue={priest.radiusKm} min={0} name="radiusKm" type="number" />
                    </label>
                    <div className="sm:col-span-2">
                      <div className="grid gap-2 text-sm font-semibold text-foreground">
                        <span>Priest service mapping</span>
                        <PriestServiceSelector
                          categories={ritualStore.categories.map((category) => ({
                            id: category.id,
                            name: category.name,
                            parentId: category.parentId
                          }))}
                          defaultMainCategoryId={priest.mainCategoryId}
                          defaultRitualIds={priest.ritualIds}
                          defaultServiceCategoryId={priest.serviceCategoryId}
                          rituals={ritualStore.rituals.map((ritual) => ({
                            id: ritual.id,
                            name: ritual.name,
                            categoryId: ritual.categoryId
                          }))}
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="grid gap-2 text-sm font-semibold text-foreground">
                        <span>Admin notes</span>
                        <textarea
                          className="min-h-28 rounded-[22px] border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                          defaultValue={priest.notes}
                          name="notes"
                        />
                      </label>
                    </div>
                    <div className="sm:col-span-2 flex justify-end">
                      <Button type="submit">Save priest review</Button>
                    </div>
                  </div>
                </div>
              </form>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Mandatory onboarding fields</CardTitle>
            <CardDescription>These remain required so verification is auditable and district coverage is reliable.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[720px] space-y-3 overflow-y-auto pr-2 surface-scroll">
            {store.requirements.map((item) => (
              <div className="rounded-[20px] border border-border bg-white p-4" key={item}>
                <p className="text-sm font-semibold text-foreground">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

type InfoRowProps = {
  icon: typeof ScrollText;
  label: string;
  value: string;
};

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-[18px] border border-border bg-white px-3 py-2.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm leading-6 text-foreground">{value}</p>
      </div>
    </div>
  );
}
