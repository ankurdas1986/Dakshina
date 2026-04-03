import { FileJson2, Layers3, PlusCircle, ScrollText } from "lucide-react";
import { createRitual, saveRitual, saveTier } from "../../actions/rituals";
import { AdminShell } from "../../../components/admin-shell";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { requireAdminUser } from "../../../lib/auth";
import {
  getFardItemCount,
  getRitualMetrics,
  getRitualStore
} from "../../../lib/ritual-store";

export const dynamic = "force-dynamic";

type RitualsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const messageMap: Record<string, string> = {
  tier_saved: "Service tier updated and stored for local UAT.",
  ritual_saved: "Ritual details saved and stored for local UAT.",
  ritual_created: "New ritual created and stored for local UAT."
};

const errorMap: Record<string, string> = {
  invalid_fard_json: "Fard JSON is invalid. Use a valid JSON object.",
  missing_tier_id: "Tier id is missing.",
  invalid_tier_id: "Tier id is invalid.",
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
  const metrics = getRitualMetrics(store);
  const resolvedSearchParams = (await searchParams) ?? {};
  const messageKey = readParam(resolvedSearchParams, "message");
  const errorKey = readParam(resolvedSearchParams, "error");
  const bannerMessage = messageKey ? messageMap[messageKey] ?? null : null;
  const bannerError = errorKey ? errorMap[errorKey] ?? errorKey : null;

  const metricCards = [
    { label: "Service tiers", value: metrics.serviceTiers, icon: Layers3 },
    { label: "Ritual templates", value: metrics.featuredRituals, icon: ScrollText },
    { label: "Fard templates", value: metrics.fardTemplates, icon: FileJson2 }
  ];

  return (
    <AdminShell
      active="rituals"
      subtitle="Admin controls the official 4-tier ritual catalog and JSON-based Fard templates used after booking confirmation."
      title="Rituals and Fard"
      userEmail={user.email}
      subnav={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">Tier controls</Badge>
          <Badge variant="outline">Ritual library</Badge>
          <Badge variant="outline">Fard JSON</Badge>
          <Badge variant="outline">User delivery rules</Badge>
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

      <div className="grid gap-4 md:grid-cols-3">
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

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Official service structure</CardTitle>
            <CardDescription>These four tiers stay standardized but remain editable for title, focus, and pricing posture.</CardDescription>
          </CardHeader>
          <CardContent className="surface-scroll max-h-[720px] space-y-4 overflow-y-auto pr-2">
            {store.tiers.map((tier) => (
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

        <div className="space-y-5">
          <Card className="rounded-[28px] border-border/80 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Create ritual template</CardTitle>
                  <CardDescription>Add a ritual with delivery mode and Fard JSON from admin.</CardDescription>
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
                    defaultValue={store.tiers[0]?.id ?? "tier_1"}
                    label="Tier"
                    name="tierId"
                    options={store.tiers.map((tier) => ({
                      value: tier.id,
                      label: `${tier.name}: ${tier.title}`
                    }))}
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
              <CardDescription>Booking confirmation triggers checklist delivery to the user.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {store.fardRules.map((rule) => (
                <div className="rounded-[20px] border border-border bg-white p-4" key={rule}>
                  <p className="text-sm leading-6 text-muted-foreground">{rule}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Ritual template library</CardTitle>
          <CardDescription>Edit tier mapping, delivery mode, and JSON-based Fard templates for each ritual.</CardDescription>
        </CardHeader>
        <CardContent className="surface-scroll max-h-[920px] space-y-4 overflow-y-auto pr-2">
          {store.rituals.map((ritual) => (
            <form action={saveRitual} className="rounded-[24px] border border-border bg-white p-4" key={ritual.id}>
              <input name="id" type="hidden" value={ritual.id} />
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-foreground">{ritual.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Fard items: {getFardItemCount(ritual.fardTemplate)}
                  </p>
                </div>
                <Badge variant={ritual.status === "active" ? "success" : "secondary"}>{ritual.status}</Badge>
              </div>

              <div className="grid gap-3">
                <Field label="Ritual name">
                  <Input defaultValue={ritual.name} name="name" required />
                </Field>
                <div className="grid gap-3 sm:grid-cols-4">
                  <SelectField
                    defaultValue={ritual.tierId}
                    label="Tier"
                    name="tierId"
                    options={store.tiers.map((tier) => ({
                      value: tier.id,
                      label: `${tier.name}: ${tier.title}`
                    }))}
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
                </div>
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

type FieldProps = {
  label: string;
  children: React.ReactNode;
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
        className="min-h-40 rounded-[22px] border border-border bg-white px-4 py-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
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
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
