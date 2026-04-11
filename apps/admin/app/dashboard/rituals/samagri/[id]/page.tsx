import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList, Trash2 } from "lucide-react";
import { saveMasterSamagriItem, deleteMasterSamagriItem } from "../../../../actions/samagri";
import { Badge } from "../../../../../components/ui/badge";
import { Button } from "../../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "../../../../../components/ui/card";
import { ConfirmSubmitButton } from "../../../../../components/ui/confirm-submit-button";
import { FormActions } from "../../../../../components/ui/form-actions";
import { Input } from "../../../../../components/ui/input";
import { RitualField, RitualSelectField } from "../../../../../components/rituals/fields";
import { RitualPageShell } from "../../../../../components/rituals/ritual-page-shell";
import { SectionTitle } from "../../../../../components/ui/section-title";
import { getMasterSamagriById } from "../../../../../lib/master-samagri-store";

export const dynamic = "force-dynamic";

const cultureOptions = [
  { value: "Bengali", label: "Bengali" },
  { value: "North_Indian", label: "North Indian" },
  { value: "Marwadi", label: "Marwadi" },
  { value: "Odia", label: "Odia" },
  { value: "Gujarati", label: "Gujarati" }
];

type Params = Promise<{ id: string }>;

export default async function EditSamagriPage({
  params
}: {
  params: Params;
}) {
  const { id } = await params;
  const item = await getMasterSamagriById(id);

  if (!item) {
    notFound();
  }

  return (
    <RitualPageShell
      activeHref="/dashboard/rituals/samagri"
      subtitle={`Editing "${item.itemName}" — ${item.ritualLabel} (${item.cultureType.replace(/_/g, " ")})`}
      title="Edit samagri item"
    >
      {/* ─── Back link ─── */}
      <Link
        href={`/dashboard/rituals/samagri?culture=${item.cultureType}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {item.cultureType.replace(/_/g, " ")} samagri
      </Link>

      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <SectionTitle icon={ClipboardList} tone="violet">Edit item</SectionTitle>
            <Badge variant={item.isActive ? "success" : "secondary"}>
              {item.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <CardDescription>
            Update item details, local language name, or deactivate. The local name appears in the priest&apos;s native-language view.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveMasterSamagriItem} className="grid gap-4 lg:grid-cols-2">
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="createdAt" value={item.createdAt} />

            {/* Culture + Ritual */}
            <RitualSelectField label="Culture" name="cultureType" defaultValue={item.cultureType} options={cultureOptions} />
            <RitualField label="Ritual label">
              <Input name="ritualLabel" defaultValue={item.ritualLabel} required />
            </RitualField>

            {/* Item name + local name */}
            <RitualField label="Item name (English)">
              <Input name="itemName" defaultValue={item.itemName} required />
            </RitualField>
            <RitualField label="Local name (native script)">
              <Input name="localName" defaultValue={item.localName} placeholder="ঘট / घट / ଘଟ" />
            </RitualField>

            {/* Display preview for the name pair */}
            {item.localName ? (
              <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-transparent p-4 lg:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Priest view preview</p>
                <p className="mt-2 text-lg font-bold text-foreground">
                  {item.itemName} <span className="text-primary">{item.localName}</span>
                </p>
              </div>
            ) : null}

            {/* Quantity + Unit */}
            <RitualField label="Default quantity">
              <Input min={0.01} name="defaultQuantity" step="0.01" type="number" defaultValue={item.defaultQuantity} />
            </RitualField>
            <RitualField label="Unit">
              <Input name="unit" defaultValue={item.unit} />
            </RitualField>

            {/* Sort order */}
            <RitualField label="Sort order">
              <Input min={0} name="sortOrder" type="number" defaultValue={item.sortOrder} />
            </RitualField>

            {/* Spacer */}
            <div className="hidden lg:block" />

            {/* Toggles */}
            <label className="flex items-start gap-3 rounded-[20px] border border-border bg-secondary/10 p-4 lg:col-span-2">
              <input className="mt-1 h-4 w-4 rounded border-border accent-[hsl(var(--primary))]" name="isOptional" type="checkbox" defaultChecked={item.isOptional} />
              <span>
                <span className="block text-sm font-semibold text-foreground">Optional item</span>
                <span className="block text-sm leading-6 text-muted-foreground">This item can be deselected on a per-booking basis.</span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-[20px] border border-border bg-secondary/10 p-4 lg:col-span-2">
              <input className="mt-1 h-4 w-4 rounded border-border accent-[hsl(var(--primary))]" name="isActive" type="checkbox" defaultChecked={item.isActive} />
              <span>
                <span className="block text-sm font-semibold text-foreground">Active for new bookings</span>
                <span className="block text-sm leading-6 text-muted-foreground">Disable to keep the item out of new booking checklists. Existing bookings remain unaffected.</span>
              </span>
            </label>

            {/* Actions */}
            <FormActions className="lg:col-span-2">
              <ConfirmSubmitButton
                confirmLabel="Delete"
                description="This permanently deletes the master item. Use deactivation if you only want to hide it from new checklists."
                formAction={deleteMasterSamagriItem}
                label="Delete"
                title="Delete this samagri item?"
              />
              <Link href={`/dashboard/rituals/samagri?culture=${item.cultureType}`}>
                <Button type="button" variant="secondary">Cancel</Button>
              </Link>
              <Button type="submit">Save changes</Button>
            </FormActions>
          </form>
        </CardContent>
      </Card>
    </RitualPageShell>
  );
}
