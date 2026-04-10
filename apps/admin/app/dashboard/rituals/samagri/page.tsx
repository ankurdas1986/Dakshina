import { Boxes, ClipboardList } from "lucide-react";
import { createMasterSamagriItem, deleteMasterSamagriItem, saveMasterSamagriItem } from "../../../actions/samagri";
import { ConfirmSubmitButton } from "../../../../components/ui/confirm-submit-button";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "../../../../components/ui/card";
import { FormActions } from "../../../../components/ui/form-actions";
import { Input } from "../../../../components/ui/input";
import { RitualField, RitualSelectField } from "../../../../components/rituals/fields";
import { RitualPageShell } from "../../../../components/rituals/ritual-page-shell";
import { SectionTitle } from "../../../../components/ui/section-title";
import { getMasterSamagriStore } from "../../../../lib/master-samagri-store";

export const dynamic = "force-dynamic";

export default async function RitualSamagriPage() {
  const store = await getMasterSamagriStore();
  const cultureOptions = [
    { value: "Bengali", label: "Bengali" },
    { value: "North_Indian", label: "North Indian" },
    { value: "Marwadi", label: "Marwadi" },
    { value: "Odia", label: "Odia" },
    { value: "Gujarati", label: "Gujarati" }
  ];

  return (
    <RitualPageShell
      activeHref="/dashboard/rituals/samagri"
      subtitle="Master samagri checklist indexed by culture and ritual. This list powers the booking-level interactive checklist when the priest provides materials."
      title="Samagri master"
    >
      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <SectionTitle icon={ClipboardList} tone="amber">Create master samagri item</SectionTitle>
              <CardDescription>Add a new checklist item for a culture and ritual. Keep item names consistent for reporting.</CardDescription>
            </div>
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <form action={createMasterSamagriItem} className="grid gap-3 lg:grid-cols-2">
            <RitualSelectField label="Culture" name="cultureType" defaultValue="Bengali" options={cultureOptions} />
            <RitualField label="Ritual label">
              <Input name="ritualLabel" placeholder="Satyanarayan Puja" required />
            </RitualField>
            <RitualField label="Item name">
              <Input name="itemName" placeholder="Ghot" required />
            </RitualField>
            <RitualField label="Unit">
              <Input name="unit" placeholder="pcs" />
            </RitualField>
            <RitualField label="Default quantity">
              <Input min={0.01} name="defaultQuantity" step="0.01" type="number" defaultValue={1} />
            </RitualField>
            <RitualField label="Sort order">
              <Input min={0} name="sortOrder" type="number" defaultValue={0} />
            </RitualField>
            <label className="flex items-start gap-3 rounded-[20px] border border-border bg-white p-4 lg:col-span-2">
              <input className="mt-1 h-4 w-4 rounded border-border accent-[hsl(var(--primary))]" name="isOptional" type="checkbox" />
              <span>
                <span className="block text-sm font-semibold text-foreground">Optional item</span>
                <span className="block text-sm leading-6 text-muted-foreground">Mark optional when the item is not required for every booking.</span>
              </span>
            </label>
            <FormActions className="lg:col-span-2">
              <Button type="submit">Create item</Button>
            </FormActions>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <SectionTitle icon={Boxes} tone="violet">Master list</SectionTitle>
              <CardDescription>Edit, deactivate, or delete items. Deactivated items remain visible for historical booking snapshots but are not offered for new checklists.</CardDescription>
            </div>
            <Badge variant="outline">{store.items.length} items</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {store.items.length ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {store.items.map((item) => (
                <form action={saveMasterSamagriItem} className="rounded-[24px] border border-border bg-white p-4" key={item.id}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="createdAt" value={item.createdAt} />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{item.itemName}</p>
                    <Badge variant={item.isActive ? "success" : "secondary"}>{item.isActive ? "active" : "inactive"}</Badge>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <RitualSelectField label="Culture" name="cultureType" defaultValue={item.cultureType} options={cultureOptions} />
                    <RitualField label="Ritual label">
                      <Input name="ritualLabel" defaultValue={item.ritualLabel} />
                    </RitualField>
                    <RitualField label="Item name">
                      <Input name="itemName" defaultValue={item.itemName} />
                    </RitualField>
                    <RitualField label="Unit">
                      <Input name="unit" defaultValue={item.unit} />
                    </RitualField>
                    <RitualField label="Default quantity">
                      <Input min={0.01} name="defaultQuantity" step="0.01" type="number" defaultValue={item.defaultQuantity} />
                    </RitualField>
                    <RitualField label="Sort order">
                      <Input min={0} name="sortOrder" type="number" defaultValue={item.sortOrder} />
                    </RitualField>
                    <label className="flex items-start gap-3 rounded-[20px] border border-border bg-secondary/20 p-4 md:col-span-2">
                      <input className="mt-1 h-4 w-4 rounded border-border accent-[hsl(var(--primary))]" name="isOptional" type="checkbox" defaultChecked={item.isOptional} />
                      <span>
                        <span className="block text-sm font-semibold text-foreground">Optional</span>
                        <span className="block text-sm leading-6 text-muted-foreground">This item can be deselected on a per-booking basis.</span>
                      </span>
                    </label>
                    <label className="flex items-start gap-3 rounded-[20px] border border-border bg-secondary/20 p-4 md:col-span-2">
                      <input className="mt-1 h-4 w-4 rounded border-border accent-[hsl(var(--primary))]" name="isActive" type="checkbox" defaultChecked={item.isActive} />
                      <span>
                        <span className="block text-sm font-semibold text-foreground">Active for new bookings</span>
                        <span className="block text-sm leading-6 text-muted-foreground">Disable to keep the item out of new booking checklists.</span>
                      </span>
                    </label>
                  </div>
                  <FormActions className="mt-4">
                    <ConfirmSubmitButton
                      confirmLabel="Delete"
                      description="This deletes the master item. Use deactivation if you only want to hide it from new checklists."
                      formAction={deleteMasterSamagriItem}
                      label="Delete"
                      title="Delete this master samagri item?"
                    />
                    <Button type="submit">Save item</Button>
                  </FormActions>
                </form>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-border bg-secondary/20 px-4 py-10 text-center text-sm text-muted-foreground">
              No master samagri items yet.
            </div>
          )}
        </CardContent>
      </Card>
    </RitualPageShell>
  );
}
