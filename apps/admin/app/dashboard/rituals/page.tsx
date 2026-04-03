import type { ReactNode } from "react";
import { FileJson2, FolderTree, Layers3, PlusCircle, ScrollText } from "lucide-react";
import { createCategory, createRitual, saveCategory, saveRitual, saveTier } from "../../actions/rituals";
import { AdminShell } from "../../../components/admin-shell";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { requireAdminUser } from "../../../lib/auth";
import { getBookingStore } from "../../../lib/booking-store";
import {
  buildCategoryLabel,
  getCategoryDepth,
  getChildCategories,
  getFardItemCount,
  getLeafCategoryOptions,
  getRitualMetrics,
  getRitualStore
} from "../../../lib/ritual-store";

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

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function RitualsPage({ searchParams }: RitualsPageProps) {
  const user = await requireAdminUser();
  const store = await getRitualStore();
  const bookingStore = await getBookingStore();
  const metrics = getRitualMetrics(store);
  const resolvedSearchParams = (await searchParams) ?? {};
  const messageKey = readParam(resolvedSearchParams, "message");
  const errorKey = readParam(resolvedSearchParams, "error");
  const query = readParam(resolvedSearchParams, "q")?.toLowerCase() ?? "";
  const bannerMessage = messageKey ? messageMap[messageKey] ?? null : null;
  const bannerError = errorKey ? errorMap[errorKey] ?? errorKey : null;
  const leafCategoryOptions = getLeafCategoryOptions(store.categories);
  const topLevelCategories = getChildCategories(null, store.categories);
  const filteredTiers = store.tiers.filter((tier) =>
    [tier.name, tier.title, tier.focus, tier.pricingMode, tier.status].join(" ").toLowerCase().includes(query)
  );
  const filteredTopLevelCategories = topLevelCategories.filter((category) =>
    buildCategoryLabel(category.id, store.categories).toLowerCase().includes(query) ||
    category.description.toLowerCase().includes(query)
  );
  const filteredRituals = store.rituals.filter((ritual) =>
    [
      ritual.name,
      buildCategoryLabel(ritual.categoryId, store.categories),
      ritual.status,
      ritual.deliveryMode,
      ritual.pricingMode
    ]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );
  const filteredFardRules = store.fardRules.filter((rule) => rule.toLowerCase().includes(query));
  const snapshotCases = bookingStore.cases.filter((booking) =>
    !query || [booking.bookingCode, booking.ritual, booking.fardSnapshotLockedAt].join(" ").toLowerCase().includes(query)
  );

  const metricCards = [
    { label: "Service tiers", value: metrics.serviceTiers, icon: Layers3 },
    { label: "Category tree nodes", value: metrics.categoryCount, icon: FolderTree },
    { label: "Ritual templates", value: metrics.ritualCount, icon: ScrollText },
    { label: "Fard templates", value: metrics.fardTemplates, icon: FileJson2 }
  ];

  return (
    <AdminShell
      active="rituals"
      subtitle="Admin controls the category tree, official ritual catalog, and JSON-based Fard templates used after booking confirmation."
      title="Rituals and Fard"
      userEmail={user.email}
      subnav={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">Category tree</Badge>
          <Badge variant="outline">Tier controls</Badge>
          <Badge variant="outline">Ritual library</Badge>
          <Badge variant="outline">Fard JSON</Badge>
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

      <form className="rounded-[20px] border border-border bg-white px-4 py-3 shadow-soft">
        <label className="grid gap-2 text-sm font-semibold text-foreground">
          <span>Search ritual operations</span>
          <Input defaultValue={query} name="q" placeholder="Search category, ritual, tier, snapshot..." />
        </label>
      </form>

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

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Official service structure</CardTitle>
            <CardDescription>These four tiers stay standardized but remain editable for title, focus, and pricing posture.</CardDescription>
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
                  <Field label="Tier title">
                    <Input defaultValue={tier.title} name="title" required />
                  </Field>
                  <TextAreaField label="Tier focus" defaultValue={tier.focus} name="focus" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SelectField
                      defaultValue={tier.status}
                      label="Status"
                      name="status"
                      options={[
                        { value: "active", label: "active" },
                        { value: "planned", label: "planned" }
                      ]}
                    />
                    <SelectField
                      defaultValue={tier.pricingMode}
                      label="Pricing mode"
                      name="pricingMode"
                      options={[
                        { value: "admin-guided", label: "admin-guided" },
                        { value: "hybrid", label: "hybrid" },
                        { value: "contract", label: "contract" }
                      ]}
                    />
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
                <CardDescription>Add a root category or nest a sub-category under an existing branch.</CardDescription>
              </div>
              <PlusCircle className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <form action={createCategory} className="grid gap-3">
              <Field label="Category name">
                <Input name="name" placeholder="Example: Seasonal Puja" required />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField
                  defaultValue={store.tiers[0]?.id ?? "tier_1"}
                  label="Tier"
                  name="tierId"
                  options={store.tiers.map((tier) => ({
                    value: tier.id,
                    label: `${tier.name}: ${tier.title}`
                  }))}
                />
                <SelectField
                  defaultValue=""
                  label="Parent category"
                  name="parentId"
                  options={[
                    { value: "", label: "No parent (root category)" },
                    ...store.categories.map((category) => ({
                      value: category.id,
                      label: buildCategoryLabel(category.id, store.categories)
                    }))
                  ]}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                <Field label="Slug">
                  <Input name="slug" placeholder="seasonal-puja" />
                </Field>
                <Field label="Order">
                  <Input defaultValue={1} min={1} name="displayOrder" type="number" />
                </Field>
              </div>
              <TextAreaField
                defaultValue=""
                label="Description"
                name="description"
              />
              <div className="flex justify-end">
                <Button type="submit">Create category</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Category tree management</CardTitle>
            <CardDescription>Manage nested ritual categories with parent-child relationships and tier ownership.</CardDescription>
          </CardHeader>
          <CardContent className="surface-scroll max-h-[920px] space-y-4 overflow-y-auto pr-2">
            {filteredTopLevelCategories.map((category) => (
              <CategoryBranch key={category.id} categoryId={category.id} store={store} />
            ))}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="rounded-[28px] border-border/80 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Create ritual template</CardTitle>
                  <CardDescription>Add a ritual under a leaf category with delivery mode and Fard JSON from admin.</CardDescription>
                </div>
                <PlusCircle className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <form action={createRitual} className="grid gap-3">
                <Field label="Ritual name">
                  <Input name="name" placeholder="Example: Saraswati Puja" required />
                </Field>
                <div className="grid gap-3 sm:grid-cols-3">
                  <SelectField
                    defaultValue={leafCategoryOptions[0]?.value ?? ""}
                    label="Leaf category"
                    name="categoryId"
                    options={leafCategoryOptions}
                  />
                  <SelectField
                    defaultValue="draft"
                    label="Status"
                    name="status"
                    options={[
                      { value: "draft", label: "draft" },
                      { value: "active", label: "active" }
                    ]}
                  />
                  <SelectField
                    defaultValue="ui_and_pdf"
                    label="Delivery"
                    name="deliveryMode"
                    options={[
                      { value: "ui_and_pdf", label: "UI and PDF" },
                      { value: "ui_only", label: "UI only" }
                    ]}
                  />
                </div>
                <SelectField
                  defaultValue="admin-guided"
                  label="Pricing mode"
                  name="pricingMode"
                  options={[
                    { value: "admin-guided", label: "admin-guided" },
                    { value: "hybrid", label: "hybrid" },
                    { value: "contract", label: "contract" }
                  ]}
                />
                <TextAreaField
                  defaultValue={JSON.stringify({ items: [{ label: "", quantity: "" }] }, null, 2)}
                  label="Fard JSON"
                  name="fardTemplate"
                />
                <div className="flex justify-end">
                  <Button type="submit">Create ritual</Button>
                </div>
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
              <CardDescription>These examples prove the booking-side checklist is locked even if the live ritual template changes later.</CardDescription>
            </CardHeader>
            <CardContent className="surface-scroll max-h-[320px] space-y-3 overflow-y-auto pr-2">
              {snapshotCases.map((booking) => (
                <div className="rounded-[20px] border border-border bg-white p-4" key={booking.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{booking.bookingCode} - {booking.ritual}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Locked at {booking.fardSnapshotLockedAt || "booking confirmation"}</p>
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

      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Ritual template library</CardTitle>
          <CardDescription>Edit category mapping, delivery mode, and JSON-based Fard templates for each ritual.</CardDescription>
        </CardHeader>
        <CardContent className="surface-scroll max-h-[920px] space-y-4 overflow-y-auto pr-2">
          {filteredRituals.map((ritual) => (
            <form action={saveRitual} className="rounded-[24px] border border-border bg-white p-4" key={ritual.id}>
              <input name="id" type="hidden" value={ritual.id} />
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-foreground">{ritual.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {buildCategoryLabel(ritual.categoryId, store.categories)} · Fard items: {getFardItemCount(ritual.fardTemplate)}
                  </p>
                </div>
                <Badge variant={ritual.status === "active" ? "success" : "secondary"}>{ritual.status}</Badge>
              </div>

              <div className="grid gap-3">
                <Field label="Ritual name">
                  <Input defaultValue={ritual.name} name="name" required />
                </Field>
                <div className="grid gap-3 sm:grid-cols-3">
                  <SelectField
                    defaultValue={ritual.categoryId}
                    label="Leaf category"
                    name="categoryId"
                    options={leafCategoryOptions}
                  />
                  <SelectField
                    defaultValue={ritual.status}
                    label="Status"
                    name="status"
                    options={[
                      { value: "draft", label: "draft" },
                      { value: "active", label: "active" }
                    ]}
                  />
                  <SelectField
                    defaultValue={ritual.deliveryMode}
                    label="Delivery"
                    name="deliveryMode"
                    options={[
                      { value: "ui_and_pdf", label: "UI and PDF" },
                      { value: "ui_only", label: "UI only" }
                    ]}
                  />
                </div>
                <SelectField
                  defaultValue={ritual.pricingMode}
                  label="Pricing mode"
                  name="pricingMode"
                  options={[
                    { value: "admin-guided", label: "admin-guided" },
                    { value: "hybrid", label: "hybrid" },
                    { value: "contract", label: "contract" }
                  ]}
                />
                <TextAreaField
                  defaultValue={JSON.stringify(ritual.fardTemplate, null, 2)}
                  label="Fard JSON"
                  name="fardTemplate"
                />
                <div className="flex justify-end">
                  <Button type="submit" variant="secondary">Save ritual</Button>
                </div>
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
  store: Awaited<ReturnType<typeof getRitualStore>>;
};

function CategoryBranch({ categoryId, store }: CategoryBranchProps) {
  const category = store.categories.find((item) => item.id === categoryId);

  if (!category) {
    return null;
  }

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
            <p className="mt-1 text-xs text-muted-foreground">Depth {depth + 1} · Tier {tier?.name ?? category.tierId}</p>
          </div>
          <Badge variant={children.length > 0 ? "outline" : "secondary"}>
            {children.length > 0 ? `${children.length} sub-categories` : "leaf category"}
          </Badge>
        </div>
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Category name">
              <Input defaultValue={category.name} name="name" required />
            </Field>
            <Field label="Slug">
              <Input defaultValue={category.slug} name="slug" />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_140px]">
            <SelectField
              defaultValue={category.parentId ?? ""}
              label="Parent category"
              name="parentId"
              options={[
                { value: "", label: "No parent (root category)" },
                ...store.categories
                  .filter((item) => item.id !== category.id)
                  .map((item) => ({
                    value: item.id,
                    label: buildCategoryLabel(item.id, store.categories)
                  }))
              ]}
            />
            <SelectField
              defaultValue={category.tierId}
              label="Tier"
              name="tierId"
              options={store.tiers.map((tierItem) => ({
                value: tierItem.id,
                label: `${tierItem.name}: ${tierItem.title}`
              }))}
            />
            <Field label="Order">
              <Input defaultValue={category.displayOrder} min={1} name="displayOrder" type="number" />
            </Field>
          </div>
          <TextAreaField defaultValue={category.description} label="Description" name="description" />
          {linkedRituals.length > 0 ? (
            <div className="rounded-[20px] border border-dashed border-border bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              Linked rituals: {linkedRituals.map((ritual) => ritual.name).join(", ")}
            </div>
          ) : null}
          <div className="flex justify-end">
            <Button type="submit" variant="secondary">Save category</Button>
          </div>
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
        className="min-h-28 rounded-[22px] border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
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
      <select
        className="h-11 rounded-[22px] border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        defaultValue={defaultValue}
        name={name}
      >
        {options.map((option) => (
          <option key={option.value || "__empty"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
