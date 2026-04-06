import type { ReactNode } from "react";
import { CalendarSearch, FileJson2, FolderTree, Globe2, Layers3, PlusCircle, ScrollText } from "lucide-react";
import { createCategory, createRitual, saveCategory, saveRitual, saveTier } from "../../actions/rituals";
import { AdminShell } from "../../../components/admin-shell";
import { SectionNav } from "../../../components/section-nav";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { getAdminShellData } from "../../../lib/admin-shell-data";
import { requireAdminUser } from "../../../lib/auth";
import { getBookingStore } from "../../../lib/booking-store";
import {
  buildCategoryLabel,
  getCategoriesByCulture,
  getCategoryDepth,
  getChildCategories,
  getFardItemCount,
  getLeafCategoryOptions,
  getRitualMetrics,
  getRitualStore,
  getTopDemandRituals,
  type CategoryNodeType,
  type RitualStore
} from "../../../lib/ritual-store";
import type { CultureType } from "../../../lib/settings";

export const dynamic = "force-dynamic";

type RitualsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const messageMap: Record<string, string> = {
  tier_saved: "Service tier updated and stored for local UAT.",
  category_saved: "Category tree change saved and synced to linked rituals.",
  category_created: "New category added to the hierarchical ritual tree.",
  ritual_saved: "Ritual details saved and stored for local UAT.",
  ritual_created: "New ritual created and stored for local UAT."
};

const errorMap: Record<string, string> = {
  invalid_fard_json: "Fard JSON is invalid. Use a valid JSON object.",
  missing_tier_id: "Tier id is missing.",
  invalid_tier_id: "Tier id is invalid.",
  missing_category_id: "Category id is missing.",
  invalid_category_id: "Category id is invalid.",
  invalid_parent_category: "Parent category is invalid.",
  missing_ritual_id: "Ritual id is missing.",
  invalid_ritual_id: "Ritual id is invalid."
};

const cultureOptions: Array<{ value: string; label: string }> = [
  { value: "all", label: "All cultures" },
  { value: "Bengali", label: "Bengali" },
  { value: "North_Indian", label: "North Indian" },
  { value: "Marwadi", label: "Marwadi" },
  { value: "Odia", label: "Odia" },
  { value: "Gujarati", label: "Gujarati" }
];

const nodeTypeOptions: Array<{ value: CategoryNodeType; label: string }> = [
  { value: "tradition", label: "Tradition" },
  { value: "service_type", label: "Service type" },
  { value: "sub_type", label: "Specific ritual group" }
];

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function formatCulture(cultureType: CultureType) {
  return cultureType.replace("_", " ");
}

export default async function RitualsPage({ searchParams }: RitualsPageProps) {
  const user = await requireAdminUser();
  const { notifications, notificationCount, notificationEnabled } = await getAdminShellData();
  const store = await getRitualStore();
  const bookingStore = await getBookingStore();
  const metrics = getRitualMetrics(store);
  const resolvedSearchParams = (await searchParams) ?? {};
  const messageKey = readParam(resolvedSearchParams, "message");
  const errorKey = readParam(resolvedSearchParams, "error");
  const cultureFilter = (readParam(resolvedSearchParams, "culture") ?? "all") as string;
  const query = readParam(resolvedSearchParams, "q")?.toLowerCase() ?? "";
  const bannerMessage = messageKey ? messageMap[messageKey] ?? null : null;
  const bannerError = errorKey ? errorMap[errorKey] ?? errorKey : null;
  const leafCategoryOptions = getLeafCategoryOptions(store.categories).filter((option) =>
    cultureFilter === "all" || option.label.startsWith(`${cultureFilter}:`)
  );
  const groupedCategories = getCategoriesByCulture(store.categories);
  const filteredTopDemand = getTopDemandRituals(store).filter(
    (ritual) =>
      (cultureFilter === "all" || ritual.cultureType === cultureFilter) &&
      [ritual.name, ritual.demandLabel, ritual.cultureType].join(" ").toLowerCase().includes(query)
  );
  const filteredTiers = store.tiers.filter((tier) =>
    [tier.name, tier.title, tier.focus, tier.pricingMode, tier.status].join(" ").toLowerCase().includes(query)
  );
  const filteredRituals = store.rituals.filter((ritual) =>
    (cultureFilter === "all" || ritual.cultureType === cultureFilter) &&
    [
      ritual.name,
      ritual.cultureType,
      buildCategoryLabel(ritual.categoryId, store.categories),
      ritual.status,
      ritual.deliveryMode,
      ritual.pricingMode,
      ritual.demandLabel
    ]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );
  const filteredFardRules = store.fardRules.filter((rule) => rule.toLowerCase().includes(query));
  const snapshotCases = bookingStore.cases.filter(
    (booking) =>
      (cultureFilter === "all" || booking.cultureType === cultureFilter) &&
      (!query || [booking.bookingCode, booking.ritual, booking.fardSnapshotLockedAt].join(" ").toLowerCase().includes(query))
  );
  const filteredResearch = store.panjikaResearch.filter(
    (entry) =>
      (cultureFilter === "all" || entry.cultureType === cultureFilter) &&
      [entry.cultureType, entry.sources.join(" ")].join(" ").toLowerCase().includes(query)
  );

  const metricCards = [
    { label: "Service tiers", value: metrics.serviceTiers, icon: Layers3 },
    { label: "Cultures covered", value: metrics.culturesCovered, icon: Globe2 },
    { label: "Category tree nodes", value: metrics.categoryCount, icon: FolderTree },
    { label: "Ritual templates", value: metrics.ritualCount, icon: ScrollText },
    { label: "Fard templates", value: metrics.fardTemplates, icon: FileJson2 }
  ];

  return (
    <AdminShell
      active="rituals"
      notificationCount={notificationCount}
      notificationEnabled={notificationEnabled}
      notifications={notifications}
      subtitle="Admin controls the culture-aware category tree, Panjika research sources, top-demand rituals, and JSON-based Fard templates used after booking confirmation."
      title="Rituals and Fard"
      userEmail={user.email}
      subnav={
        <SectionNav
          items={[
            { href: "#top-demand", label: "Bengali-first", primary: true },
            { href: "#category-tree", label: "Culture tree" },
            { href: "#panjika-sources", label: "Panjika sources" },
            { href: "#ritual-library", label: "Pricing splits" }
          ]}
        />
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

      <form className="grid gap-3 rounded-[20px] border border-border bg-white px-4 py-3 shadow-soft lg:grid-cols-[minmax(0,1.4fr)_220px_auto]">
        <label className="grid gap-2 text-sm font-semibold text-foreground">
          <span>Search ritual operations</span>
          <Input defaultValue={query} name="q" placeholder="Search culture, ritual, Panjika source, or Fard snapshot..." />
        </label>
        <SelectField label="Culture filter" name="culture" defaultValue={cultureFilter} options={cultureOptions} />
        <div className="flex items-end justify-end">
          <Button className="h-11 rounded-lg" type="submit">Apply</Button>
        </div>
      </form>

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
        <Card className="scroll-mt-28 rounded-[28px] border-border/80 bg-white" id="top-demand">
          <CardHeader>
            <CardTitle className="text-lg">Top demand rituals by culture</CardTitle>
            <CardDescription>Homepage ranking remains seeded Bengali-first while other traditions stay ready for phased rollout.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {filteredTopDemand.slice(0, 8).map((ritual) => (
              <div className="rounded-[22px] border border-border bg-white p-4" key={ritual.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{ritual.name}</p>
                  <Badge variant={ritual.cultureType === "Bengali" ? "success" : "outline"}>{formatCulture(ritual.cultureType)}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{ritual.demandLabel}</p>
                <p className="mt-2 text-xs text-muted-foreground">Homepage rank {ritual.homepageRank ?? "-"} | {buildCategoryLabel(ritual.categoryId, store.categories)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="scroll-mt-28 rounded-[28px] border-border/80 bg-white" id="panjika-sources">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Smart Panjika import workspace</CardTitle>
                <CardDescription>Select a tradition first, then import raw text under the correct calendar source.</CardDescription>
              </div>
              <CalendarSearch className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredResearch.map((entry) => (
              <div className="rounded-[22px] border border-border bg-white p-4" key={entry.cultureType}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{formatCulture(entry.cultureType)}</p>
                  <Badge variant={entry.cultureType === "Bengali" ? "success" : "outline"}>{entry.sources[0]}</Badge>
                </div>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Sources</p>
                <p className="mt-1 text-sm text-foreground">{entry.sources.join(" / ")}</p>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Admin instruction</p>
                <p className="mt-1 text-sm text-muted-foreground">{entry.adminInstruction}</p>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Seed rituals</p>
                <p className="mt-1 text-sm text-muted-foreground">{entry.sampleRituals.join(", ")}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="scroll-mt-28 rounded-[28px] border-border/80 bg-white" id="category-tree">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Official service tiers</CardTitle>
                <CardDescription>The tier model stays standardized while rituals and pricing remain culture-aware.</CardDescription>
              </div>
              <Layers3 className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="surface-scroll max-h-[720px] space-y-4 overflow-y-auto pr-2">
            {filteredTiers.map((tier) => (
              <form action={saveTier} className="rounded-[24px] border border-border bg-white p-4" key={tier.id}>
                <input name="id" type="hidden" value={tier.id} />
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{tier.name}</p>
                  <Badge variant={tier.status === "active" ? "success" : "secondary"}>{tier.status}</Badge>
                </div>
                <div className="grid gap-3">
                  <Field label="Tier title"><Input defaultValue={tier.title} name="title" required /></Field>
                  <TextAreaField label="Tier focus" defaultValue={tier.focus} name="focus" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SelectField label="Status" name="status" defaultValue={tier.status} options={[{ value: "active", label: "active" }, { value: "planned", label: "planned" }]} />
                    <SelectField label="Pricing mode" name="pricingMode" defaultValue={tier.pricingMode} options={[{ value: "admin-guided", label: "admin-guided" }, { value: "hybrid", label: "hybrid" }, { value: "contract", label: "contract" }]} />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" variant="secondary">Save tier</Button>
                  </div>
                </div>
              </form>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Create category node</CardTitle>
                <CardDescription>Support tradition - service type - specific ritual group across every culture.</CardDescription>
              </div>
              <PlusCircle className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <form action={createCategory} className="grid gap-3 sm:grid-cols-2">
              <Field label="Category name"><Input name="name" placeholder="Example: Marriage" required /></Field>
              <Field label="Slug"><Input name="slug" placeholder="marriage" /></Field>
              <SelectField label="Culture" name="cultureType" defaultValue={cultureFilter === "all" ? "Bengali" : cultureFilter} options={cultureOptions.filter((option) => option.value !== "all")} />
              <SelectField label="Node type" name="nodeType" defaultValue="tradition" options={nodeTypeOptions.map((option) => ({ value: option.value, label: option.label }))} />
              <SelectField label="Tier" name="tierId" defaultValue={store.tiers[0]?.id ?? "tier_1"} options={store.tiers.map((tier) => ({ value: tier.id, label: `${tier.name}: ${tier.title}` }))} />
              <SelectField label="Parent category" name="parentId" defaultValue="" options={[{ value: "", label: "No parent (root category)" }, ...store.categories.map((category) => ({ value: category.id, label: `${formatCulture(category.cultureType)}: ${buildCategoryLabel(category.id, store.categories)}` }))]} />
              <Field label="Display order"><Input defaultValue={1} min={1} name="displayOrder" type="number" /></Field>
              <div className="sm:col-span-2"><TextAreaField label="Description" name="description" defaultValue="" /></div>
              <div className="flex justify-end sm:col-span-2"><Button type="submit">Create category</Button></div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Culture category tree</CardTitle>
            <CardDescription>Bengali remains the richest launch tree, but every supported tradition can be managed here.</CardDescription>
          </CardHeader>
          <CardContent className="surface-scroll max-h-[920px] space-y-5 overflow-y-auto pr-2">
            {(cultureFilter === "all" ? cultureOptions.filter((option) => option.value !== "all").map((option) => option.value as CultureType) : [cultureFilter as CultureType]).map((cultureType) => {
              const cultureRoots = getChildCategories(null, groupedCategories[cultureType]);
              if (!cultureRoots.length) {
                return null;
              }
              return (
                <div className="space-y-3" key={cultureType}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{formatCulture(cultureType)}</p>
                    <Badge variant={cultureType === "Bengali" ? "success" : "outline"}>{cultureRoots.length} root nodes</Badge>
                  </div>
                  {cultureRoots.map((category) => (
                    <CategoryBranch categoryId={category.id} key={category.id} store={store} />
                  ))}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="rounded-[28px] border-border/80 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Create ritual template</CardTitle>
                  <CardDescription>Add a ritual under a leaf category with culture tagging, pricing split, and Fard JSON.</CardDescription>
                </div>
                <PlusCircle className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <form action={createRitual} className="grid gap-3 sm:grid-cols-2">
                <Field label="Ritual name"><Input name="name" placeholder="Example: Annaprashan" required /></Field>
                <SelectField label="Culture" name="cultureType" defaultValue={cultureFilter === "all" ? "Bengali" : cultureFilter} options={cultureOptions.filter((option) => option.value !== "all")} />
                <SelectField label="Leaf category" name="categoryId" defaultValue={leafCategoryOptions[0]?.value ?? ""} options={leafCategoryOptions} />
                <SelectField label="Status" name="status" defaultValue="draft" options={[{ value: "draft", label: "draft" }, { value: "active", label: "active" }]} />
                <SelectField label="Delivery" name="deliveryMode" defaultValue="ui_and_pdf" options={[{ value: "ui_and_pdf", label: "UI and PDF" }, { value: "ui_only", label: "UI only" }]} />
                <SelectField label="Pricing mode" name="pricingMode" defaultValue="admin-guided" options={[{ value: "admin-guided", label: "admin-guided" }, { value: "hybrid", label: "hybrid" }, { value: "contract", label: "contract" }]} />
                <Field label="Duration (minutes)"><Input defaultValue={120} min={30} name="durationMinutes" type="number" /></Field>
                <Field label="Homepage rank"><Input defaultValue={1} min={1} name="homepageRank" type="number" /></Field>
                <Field label="Demand label"><Input defaultValue="Top 8 launch ritual" name="demandLabel" /></Field>
                <Field label="Dakshina amount"><Input defaultValue={0} min={0} name="dakshinaAmount" type="number" /></Field>
                <Field label="Samagri add-ons"><Input defaultValue={0} min={0} name="samagriAddOns" type="number" /></Field>
                <Field label="Zone-wise travel fee"><Input defaultValue={0} min={0} name="zoneWiseTravelFee" type="number" /></Field>
                <Field label="Peak multiplier"><Input defaultValue={1} min={1} name="peakMultiplier" step="0.01" type="number" /></Field>
                <div className="sm:col-span-2"><TextAreaField label="Fard JSON" name="fardTemplate" defaultValue={JSON.stringify({ items: [{ label: "", quantity: "" }] }, null, 2)} /></div>
                <div className="flex justify-end sm:col-span-2"><Button type="submit">Create ritual</Button></div>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-border/80 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Fard operating rules</CardTitle>
              <CardDescription>Booking confirmation snapshots the ritual checklist before user delivery.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredFardRules.map((rule) => (
                <div className="rounded-[20px] border border-border bg-white p-4" key={rule}>
                  <p className="text-sm leading-6 text-muted-foreground">{rule}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-border/80 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Booking Fard snapshots</CardTitle>
              <CardDescription>These examples prove the booking-side checklist stays locked even if the live ritual template changes later.</CardDescription>
            </CardHeader>
            <CardContent className="surface-scroll max-h-[320px] space-y-3 overflow-y-auto pr-2">
              {snapshotCases.map((booking) => (
                <div className="rounded-[20px] border border-border bg-white p-4" key={booking.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{booking.bookingCode} - {booking.ritual}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{formatCulture(booking.cultureType)} | Locked at {booking.fardSnapshotLockedAt || "booking confirmation"}</p>
                    </div>
                    <Badge variant="outline">{booking.fardSnapshot.deliveryMode}</Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    {booking.fardSnapshot.items.map((item) => (
                      <div className="flex items-center justify-between gap-3 rounded-[16px] border border-border bg-secondary/25 px-3 py-2" key={`${booking.id}-${item.label}`}>
                        <span className="text-sm text-foreground">{item.label}</span>
                        <span className="text-sm text-muted-foreground">{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="scroll-mt-28 rounded-[28px] border-border/80 bg-white" id="ritual-library">
        <CardHeader>
          <CardTitle className="text-lg">Ritual template library</CardTitle>
          <CardDescription>Edit culture mapping, duration, demand label, pricing split, and JSON-based Fard templates for each ritual.</CardDescription>
        </CardHeader>
        <CardContent className="surface-scroll max-h-[980px] space-y-4 overflow-y-auto pr-2">
          {filteredRituals.map((ritual) => (
            <form action={saveRitual} className="rounded-[24px] border border-border bg-white p-4" key={ritual.id}>
              <input name="id" type="hidden" value={ritual.id} />
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-foreground">{ritual.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatCulture(ritual.cultureType)} | {buildCategoryLabel(ritual.categoryId, store.categories)} | Fard items: {getFardItemCount(ritual.fardTemplate)}
                  </p>
                </div>
                <Badge variant={ritual.status === "active" ? "success" : "secondary"}>{ritual.status}</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Field label="Ritual name"><Input defaultValue={ritual.name} name="name" required /></Field>
                <SelectField label="Culture" name="cultureType" defaultValue={ritual.cultureType} options={cultureOptions.filter((option) => option.value !== "all")} />
                <SelectField label="Leaf category" name="categoryId" defaultValue={ritual.categoryId} options={leafCategoryOptions} />
                <SelectField label="Status" name="status" defaultValue={ritual.status} options={[{ value: "draft", label: "draft" }, { value: "active", label: "active" }]} />
                <SelectField label="Delivery" name="deliveryMode" defaultValue={ritual.deliveryMode} options={[{ value: "ui_and_pdf", label: "UI and PDF" }, { value: "ui_only", label: "UI only" }]} />
                <SelectField label="Pricing mode" name="pricingMode" defaultValue={ritual.pricingMode} options={[{ value: "admin-guided", label: "admin-guided" }, { value: "hybrid", label: "hybrid" }, { value: "contract", label: "contract" }]} />
                <Field label="Duration (minutes)"><Input defaultValue={ritual.durationMinutes} min={30} name="durationMinutes" type="number" /></Field>
                <Field label="Homepage rank"><Input defaultValue={ritual.homepageRank ?? 1} min={1} name="homepageRank" type="number" /></Field>
                <div className="sm:col-span-2 xl:col-span-4"><Field label="Demand label"><Input defaultValue={ritual.demandLabel} name="demandLabel" /></Field></div>
                <Field label="Dakshina amount"><Input defaultValue={ritual.pricing.dakshinaAmount} min={0} name="dakshinaAmount" type="number" /></Field>
                <Field label="Samagri add-ons"><Input defaultValue={ritual.pricing.samagriAddOns} min={0} name="samagriAddOns" type="number" /></Field>
                <Field label="Zone-wise travel fee"><Input defaultValue={ritual.pricing.zoneWiseTravelFee} min={0} name="zoneWiseTravelFee" type="number" /></Field>
                <Field label="Peak multiplier"><Input defaultValue={ritual.pricing.peakMultiplier} min={1} name="peakMultiplier" step="0.01" type="number" /></Field>
                <div className="sm:col-span-2 xl:col-span-4"><TextAreaField label="Fard JSON" name="fardTemplate" defaultValue={JSON.stringify(ritual.fardTemplate, null, 2)} /></div>
                <div className="flex justify-end sm:col-span-2 xl:col-span-4"><Button type="submit" variant="secondary">Save ritual</Button></div>
              </div>
            </form>
          ))}
        </CardContent>
      </Card>
    </AdminShell>
  );
}

type CategoryBranchProps = {
  categoryId: string;
  store: RitualStore;
};

function CategoryBranch({ categoryId, store }: CategoryBranchProps) {
  const category = store.categories.find((item) => item.id === categoryId);
  if (!category) return null;

  const depth = getCategoryDepth(category.id, store.categories);
  const children = getChildCategories(category.id, store.categories);
  const tier = store.tiers.find((item) => item.id === category.tierId);
  const linkedRituals = store.rituals.filter((ritual) => ritual.categoryId === category.id);

  return (
    <div className="space-y-3">
      <form action={saveCategory} className="rounded-[24px] border border-border bg-white p-4">
        <input name="id" type="hidden" value={category.id} />
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{buildCategoryLabel(category.id, store.categories)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Depth {depth + 1} | {formatCulture(category.cultureType)} | {tier?.name ?? category.tierId}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{category.nodeType.replace("_", " ")}</Badge>
            <Badge variant={children.length > 0 ? "outline" : "secondary"}>{children.length > 0 ? `${children.length} sub-categories` : "leaf category"}</Badge>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Category name"><Input defaultValue={category.name} name="name" required /></Field>
          <Field label="Slug"><Input defaultValue={category.slug} name="slug" /></Field>
          <SelectField label="Culture" name="cultureType" defaultValue={category.cultureType} options={cultureOptions.filter((option) => option.value !== "all")} />
          <SelectField label="Node type" name="nodeType" defaultValue={category.nodeType} options={nodeTypeOptions.map((option) => ({ value: option.value, label: option.label }))} />
          <SelectField label="Parent category" name="parentId" defaultValue={category.parentId ?? ""} options={[{ value: "", label: "No parent (root category)" }, ...store.categories.filter((item) => item.id !== category.id).map((item) => ({ value: item.id, label: `${formatCulture(item.cultureType)}: ${buildCategoryLabel(item.id, store.categories)}` }))]} />
          <SelectField label="Tier" name="tierId" defaultValue={category.tierId} options={store.tiers.map((tierItem) => ({ value: tierItem.id, label: `${tierItem.name}: ${tierItem.title}` }))} />
          <Field label="Display order"><Input defaultValue={category.displayOrder} min={1} name="displayOrder" type="number" /></Field>
          <div className="sm:col-span-2 xl:col-span-4"><TextAreaField label="Description" name="description" defaultValue={category.description} /></div>
          {linkedRituals.length > 0 ? (
            <div className="rounded-[20px] border border-dashed border-border bg-primary/5 px-4 py-3 text-sm text-muted-foreground sm:col-span-2 xl:col-span-4">
              Linked rituals: {linkedRituals.map((ritual) => `${ritual.name} (${formatCulture(ritual.cultureType)})`).join(", ")}
            </div>
          ) : null}
          <div className="flex justify-end sm:col-span-2 xl:col-span-4"><Button type="submit" variant="secondary">Save category</Button></div>
        </div>
      </form>
      {children.length > 0 ? (
        <div className="space-y-3 border-l border-border/80 pl-4">
          {children.map((child) => (
            <CategoryBranch categoryId={child.id} key={child.id} store={store} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

type FieldProps = {
  label: string;
  children: ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span>{label}</span>
      {children}
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
      <textarea
        className="min-h-28 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        defaultValue={defaultValue}
        name={name}
      />
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
          <option key={option.value || "__empty"} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
