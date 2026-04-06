import { createRitual, deleteRitual, saveRitual } from "../../../actions/rituals";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { FormActions } from "../../../../components/ui/form-actions";
import { Input } from "../../../../components/ui/input";
import { RitualField, RitualSelectField, RitualTextAreaField } from "../../../../components/rituals/fields";
import { RitualPageShell } from "../../../../components/rituals/ritual-page-shell";
import { buildCategoryLabel, getFardItemCount, getLeafCategoryOptions, getRitualStore } from "../../../../lib/ritual-store";

export const dynamic = "force-dynamic";

const cultureOptions = [
  { value: "Bengali", label: "Bengali" },
  { value: "North_Indian", label: "North Indian" },
  { value: "Marwadi", label: "Marwadi" },
  { value: "Odia", label: "Odia" },
  { value: "Gujarati", label: "Gujarati" }
];

function formatCulture(value: string) {
  return value.replace("_", " ");
}

export default async function RitualLibraryPage() {
  const store = await getRitualStore();
  const leafCategoryOptions = getLeafCategoryOptions(store.categories);

  return (
    <RitualPageShell
      activeHref="/dashboard/rituals/library"
      subtitle="The ritual library keeps template editing isolated from hierarchy creation and research so pricing changes are easier to review."
      title="Ritual library"
    >
      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Create ritual template</CardTitle>
          <CardDescription>Create ritual records directly from the library workspace so create and edit stay in one operational surface.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createRitual} className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
            <input name="returnTo" type="hidden" value="/dashboard/rituals/library" />
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
            <div className="md:col-span-2"><RitualField label="Demand label"><Input defaultValue="Top 8 launch ritual" name="demandLabel" /></RitualField></div>
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

      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Ritual template library</CardTitle>
          <CardDescription>Edit culture mapping, duration, pricing split, demand rank, and Fard JSON here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {store.rituals.map((ritual) => (
            <form action={saveRitual} className="rounded-[24px] border border-border bg-white p-4" key={ritual.id}>
              <input name="id" type="hidden" value={ritual.id} />
              <input name="returnTo" type="hidden" value="/dashboard/rituals/library" />
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-foreground">{ritual.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{formatCulture(ritual.cultureType)} | {buildCategoryLabel(ritual.categoryId, store.categories)} | Fard items: {getFardItemCount(ritual.fardTemplate)}</p>
                </div>
                <Badge variant={ritual.status === "active" ? "success" : "secondary"}>{ritual.status}</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
                <RitualField label="Ritual name"><Input defaultValue={ritual.name} name="name" required /></RitualField>
                <RitualSelectField label="Culture" name="cultureType" defaultValue={ritual.cultureType} options={cultureOptions} />
                <RitualSelectField label="Leaf category" name="categoryId" defaultValue={ritual.categoryId} options={leafCategoryOptions} />
                <RitualSelectField label="Status" name="status" defaultValue={ritual.status} options={[{ value: "draft", label: "draft" }, { value: "active", label: "active" }]} />
                <RitualSelectField label="Delivery" name="deliveryMode" defaultValue={ritual.deliveryMode} options={[{ value: "ui_and_pdf", label: "UI and PDF" }, { value: "ui_only", label: "UI only" }]} />
                <RitualSelectField label="Pricing mode" name="pricingMode" defaultValue={ritual.pricingMode} options={[{ value: "admin-guided", label: "admin-guided" }, { value: "hybrid", label: "hybrid" }, { value: "contract", label: "contract" }]} />
                <RitualField label="Duration (minutes)"><Input defaultValue={ritual.durationMinutes} min={30} name="durationMinutes" type="number" /></RitualField>
                <RitualField label="Homepage rank"><Input defaultValue={ritual.homepageRank ?? 1} min={1} name="homepageRank" type="number" /></RitualField>
                <div className="md:col-span-2 xl:col-span-2"><RitualField label="Demand label"><Input defaultValue={ritual.demandLabel} name="demandLabel" /></RitualField></div>
                <RitualField label="Dakshina amount"><Input defaultValue={ritual.pricing.dakshinaAmount} min={0} name="dakshinaAmount" type="number" /></RitualField>
                <RitualField label="Samagri add-ons"><Input defaultValue={ritual.pricing.samagriAddOns} min={0} name="samagriAddOns" type="number" /></RitualField>
                <RitualField label="Zone-wise travel fee"><Input defaultValue={ritual.pricing.zoneWiseTravelFee} min={0} name="zoneWiseTravelFee" type="number" /></RitualField>
                <RitualField label="Peak multiplier"><Input defaultValue={ritual.pricing.peakMultiplier} min={1} name="peakMultiplier" step="0.01" type="number" /></RitualField>
                <div className="md:col-span-2 xl:col-span-2"><RitualTextAreaField label="Fard JSON" name="fardTemplate" defaultValue={JSON.stringify(ritual.fardTemplate, null, 2)} /></div>
                <FormActions className="md:col-span-2 xl:col-span-2">
                  <button className="inline-flex h-10 items-center justify-center rounded-xl border border-destructive/30 px-4 text-sm font-semibold text-destructive transition hover:bg-destructive/5" formAction={deleteRitual} type="submit">Delete ritual</button>
                  <Button type="submit">Save ritual</Button>
                </FormActions>
              </div>
            </form>
          ))}
        </CardContent>
      </Card>
    </RitualPageShell>
  );
}
