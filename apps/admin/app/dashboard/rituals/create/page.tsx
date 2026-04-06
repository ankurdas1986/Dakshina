import { createCategory, createRitual } from "../../../actions/rituals";
import { PlusCircle } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { FormActions } from "../../../../components/ui/form-actions";
import { Input } from "../../../../components/ui/input";
import { RitualField, RitualSelectField, RitualTextAreaField } from "../../../../components/rituals/fields";
import { RitualPageShell } from "../../../../components/rituals/ritual-page-shell";
import { buildCategoryLabel, getLeafCategoryOptions, getRitualStore, type CategoryNodeType } from "../../../../lib/ritual-store";

export const dynamic = "force-dynamic";

const cultureOptions = [
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

function formatCulture(cultureType: string) {
  return cultureType.replace("_", " ");
}

export default async function RitualCreatePage() {
  const store = await getRitualStore();
  const leafCategoryOptions = getLeafCategoryOptions(store.categories);

  return (
    <RitualPageShell
      activeHref="/dashboard/rituals/create"
      subtitle="Creation is now isolated from the library and hierarchy views, so operators can add templates without parsing long edit pages."
      title="Create ritual assets"
    >
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Create category node</CardTitle>
                <CardDescription>Create a tradition, service type, or ritual group under the cultural hierarchy.</CardDescription>
              </div>
              <PlusCircle className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <form action={createCategory} className="grid gap-3 md:grid-cols-2">
              <RitualField label="Category name"><Input name="name" placeholder="Example: Marriage" required /></RitualField>
              <RitualField label="Slug"><Input name="slug" placeholder="marriage" /></RitualField>
              <RitualSelectField label="Culture" name="cultureType" defaultValue="Bengali" options={cultureOptions} />
              <RitualSelectField label="Node type" name="nodeType" defaultValue="tradition" options={nodeTypeOptions.map((option) => ({ value: option.value, label: option.label }))} />
              <RitualSelectField label="Tier" name="tierId" defaultValue={store.tiers[0]?.id ?? "tier_1"} options={store.tiers.map((tier) => ({ value: tier.id, label: `${tier.name}: ${tier.title}` }))} />
              <div className="md:col-span-2">
                <RitualSelectField label="Parent category" name="parentId" defaultValue="" options={[{ value: "", label: "No parent (root category)" }, ...store.categories.map((category) => ({ value: category.id, label: `${formatCulture(category.cultureType)}: ${buildCategoryLabel(category.id, store.categories)}` }))]} />
              </div>
              <RitualField label="Display order"><Input defaultValue={1} min={1} name="displayOrder" type="number" /></RitualField>
              <div className="md:col-span-2"><RitualTextAreaField label="Description" name="description" defaultValue="" /></div>
              <FormActions className="md:col-span-2">
                <Button type="submit">Create category</Button>
              </FormActions>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Create ritual template</CardTitle>
                <CardDescription>Add a ritual under a leaf category with pricing split and Fard JSON.</CardDescription>
              </div>
              <PlusCircle className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <form action={createRitual} className="grid gap-3 md:grid-cols-2">
              <RitualField label="Ritual name"><Input name="name" placeholder="Example: Annaprashan" required /></RitualField>
              <RitualSelectField label="Culture" name="cultureType" defaultValue="Bengali" options={cultureOptions} />
              <div className="md:col-span-2">
                <RitualSelectField label="Leaf category" name="categoryId" defaultValue={leafCategoryOptions[0]?.value ?? ""} options={leafCategoryOptions} />
              </div>
              <RitualSelectField label="Status" name="status" defaultValue="draft" options={[{ value: "draft", label: "draft" }, { value: "active", label: "active" }]} />
              <RitualSelectField label="Delivery" name="deliveryMode" defaultValue="ui_and_pdf" options={[{ value: "ui_and_pdf", label: "UI and PDF" }, { value: "ui_only", label: "UI only" }]} />
              <RitualSelectField label="Pricing mode" name="pricingMode" defaultValue="admin-guided" options={[{ value: "admin-guided", label: "admin-guided" }, { value: "hybrid", label: "hybrid" }, { value: "contract", label: "contract" }]} />
              <RitualField label="Duration (minutes)"><Input defaultValue={120} min={30} name="durationMinutes" type="number" /></RitualField>
              <RitualField label="Homepage rank"><Input defaultValue={1} min={1} name="homepageRank" type="number" /></RitualField>
              <RitualField label="Demand label"><Input defaultValue="Top 8 launch ritual" name="demandLabel" /></RitualField>
              <RitualField label="Dakshina amount"><Input defaultValue={0} min={0} name="dakshinaAmount" type="number" /></RitualField>
              <RitualField label="Samagri add-ons"><Input defaultValue={0} min={0} name="samagriAddOns" type="number" /></RitualField>
              <RitualField label="Zone-wise travel fee"><Input defaultValue={0} min={0} name="zoneWiseTravelFee" type="number" /></RitualField>
              <RitualField label="Peak multiplier"><Input defaultValue={1} min={1} name="peakMultiplier" step="0.01" type="number" /></RitualField>
              <div className="md:col-span-2"><RitualTextAreaField label="Fard JSON" name="fardTemplate" defaultValue={JSON.stringify({ items: [{ label: "", quantity: "" }] }, null, 2)} /></div>
              <FormActions className="md:col-span-2">
                <Button type="submit">Create ritual</Button>
              </FormActions>
            </form>
          </CardContent>
        </Card>
      </div>
    </RitualPageShell>
  );
}
