import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { createMasterSamagriItem } from "../../../../actions/samagri";
import { Button } from "../../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "../../../../../components/ui/card";
import { FormActions } from "../../../../../components/ui/form-actions";
import { Input } from "../../../../../components/ui/input";
import { RitualField, RitualSelectField } from "../../../../../components/rituals/fields";
import { RitualPageShell } from "../../../../../components/rituals/ritual-page-shell";
import { SectionTitle } from "../../../../../components/ui/section-title";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ culture?: string }>;

const cultureOptions = [
  { value: "Bengali", label: "Bengali" },
  { value: "North_Indian", label: "North Indian" },
  { value: "Marwadi", label: "Marwadi" },
  { value: "Odia", label: "Odia" },
  { value: "Gujarati", label: "Gujarati" }
];

export default async function CreateSamagriPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const defaultCulture = params.culture ?? "Bengali";

  return (
    <RitualPageShell
      activeHref="/dashboard/rituals/samagri"
      subtitle="Add a new checklist item to the master samagri list."
      title="Create samagri item"
    >
      {/* ─── Back link ─── */}
      <Link
        href="/dashboard/rituals/samagri"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to samagri list
      </Link>

      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <SectionTitle icon={ClipboardList} tone="amber">New samagri item</SectionTitle>
          <CardDescription>
            Fill in the details below to add a new item to the culture-specific master samagri checklist.
            The <strong>local name</strong> will be shown to priests in their native script.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createMasterSamagriItem} className="grid gap-4 lg:grid-cols-2">
            {/* Culture + Ritual */}
            <RitualSelectField label="Culture" name="cultureType" defaultValue={defaultCulture} options={cultureOptions} />
            <RitualField label="Ritual label">
              <Input name="ritualLabel" placeholder="Satyanarayan Puja" required />
            </RitualField>

            {/* Item name + local name */}
            <RitualField label="Item name (English)">
              <Input name="itemName" placeholder="Ghot" required />
            </RitualField>
            <RitualField label="Local name (native script)">
              <Input name="localName" placeholder="ঘট / घट / ଘଟ" />
            </RitualField>

            {/* Quantity + Unit */}
            <RitualField label="Default quantity">
              <Input min={0.01} name="defaultQuantity" step="0.01" type="number" defaultValue={1} />
            </RitualField>
            <RitualField label="Unit">
              <Input name="unit" placeholder="pcs, pkt, bundle, set" />
            </RitualField>

            {/* Sort order */}
            <RitualField label="Sort order">
              <Input min={0} name="sortOrder" type="number" defaultValue={0} />
            </RitualField>

            {/* Spacer on large screens */}
            <div className="hidden lg:block" />

            {/* Optional checkbox */}
            <label className="flex items-start gap-3 rounded-[20px] border border-border bg-secondary/10 p-4 lg:col-span-2">
              <input className="mt-1 h-4 w-4 rounded border-border accent-[hsl(var(--primary))]" name="isOptional" type="checkbox" />
              <span>
                <span className="block text-sm font-semibold text-foreground">Optional item</span>
                <span className="block text-sm leading-6 text-muted-foreground">Mark optional when the item is not required for every booking.</span>
              </span>
            </label>

            {/* Actions */}
            <FormActions className="lg:col-span-2">
              <Link href="/dashboard/rituals/samagri">
                <Button type="button" variant="secondary">Cancel</Button>
              </Link>
              <Button type="submit">Create item</Button>
            </FormActions>
          </form>
        </CardContent>
      </Card>
    </RitualPageShell>
  );
}
