import { savePanjikaResearch, deletePanjikaResearch } from "../../../actions/rituals";
import { CalendarSearch } from "lucide-react";
import { bulkUploadMasterPanjika, deleteMasterPanjikaSlot } from "../../../actions/master-panjika";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { ConfirmSubmitButton } from "../../../../components/ui/confirm-submit-button";
import { Card, CardContent, CardDescription, CardHeader } from "../../../../components/ui/card";
import { FormActions } from "../../../../components/ui/form-actions";
import { Input } from "../../../../components/ui/input";
import { RitualField, RitualSelectField, RitualTextAreaField } from "../../../../components/rituals/fields";
import { RitualPageShell } from "../../../../components/rituals/ritual-page-shell";
import { SectionTitle } from "../../../../components/ui/section-title";
import { getMasterPanjikaStore } from "../../../../lib/master-panjika-store";
import { getRitualStore } from "../../../../lib/ritual-store";

export const dynamic = "force-dynamic";

function formatCulture(value: string) {
  return value.replace("_", " ");
}

export default async function RitualPanjikaPage() {
  const store = await getRitualStore();
  const master = await getMasterPanjikaStore();
  const cultureOptions = [
    { value: "Bengali", label: "Bengali" },
    { value: "North_Indian", label: "North Indian" },
    { value: "Marwadi", label: "Marwadi" },
    { value: "Odia", label: "Odia" },
    { value: "Gujarati", label: "Gujarati" }
  ];

  return (
    <RitualPageShell
      activeHref="/dashboard/rituals/panjika"
      subtitle="Maintain culture-aware Panjika research sources and the annual master auspicious-slot engine used for recommended scheduling."
      title="Panjika"
    >
      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <SectionTitle icon={CalendarSearch} tone="blue">Master Panjika engine (annual auspicious slots)</SectionTitle>
              <CardDescription>Upload annual auspicious slots via CSV for culture and ritual scheduling guidance. These slots power the &quot;Top 3 recommended&quot; cards at booking time.</CardDescription>
            </div>
            <CalendarSearch className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={bulkUploadMasterPanjika} className="grid gap-3 rounded-[24px] border border-border bg-secondary/20 p-4 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">CSV file upload</p>
              <input
                accept=".csv,text/csv"
                className="block w-full rounded-[18px] border border-border bg-white px-4 py-3 text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
                name="csvFile"
                type="file"
              />
              <p className="text-xs leading-5 text-muted-foreground">Columns: culture_type, ritual_label, slot_date, start_time, end_time, tithi (optional: ritual_id, source_note).</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Or paste CSV</p>
              <textarea
                className="h-28 w-full rounded-[18px] border border-border bg-white p-3 text-sm text-foreground"
                name="csvText"
                placeholder="culture_type,ritual_label,slot_date,start_time,end_time,tithi"
              />
              <FormActions className="pt-1">
                <Button type="submit">Upload slots</Button>
              </FormActions>
            </div>
          </form>

          <div className="rounded-[24px] border border-border bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Stored slots</p>
              <Badge variant="outline">{master.slots.length} slots</Badge>
            </div>
            <div className="surface-scroll max-h-[420px] overflow-y-auto">
              {master.slots.length ? (
                master.slots
                  .slice()
                  .sort((a, b) => b.slotDate.localeCompare(a.slotDate) || a.startTime.localeCompare(b.startTime))
                  .map((slot) => (
                    <form
                      action={deleteMasterPanjikaSlot}
                      className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-4 last:border-b-0"
                      key={slot.id}
                    >
                      <input name="id" type="hidden" value={slot.id} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {slot.slotDate} - {slot.startTime}-{slot.endTime}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatCulture(slot.cultureType)} - {slot.ritualLabel} {slot.tithi ? `- ${slot.tithi}` : ""}
                        </p>
                      </div>
                      <ConfirmSubmitButton
                        confirmLabel="Delete slot"
                        description="This removes the slot from the master Panjika engine. Recommended slot cards will no longer show it."
                        label="Delete"
                        title="Delete this master Panjika slot?"
                      />
                    </form>
                  ))
              ) : (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">No master Panjika slots uploaded yet.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <SectionTitle icon={CalendarSearch} tone="violet">Smart Panjika import workspace</SectionTitle>
              <CardDescription>Select a tradition first, then import raw text under the correct calendar source.</CardDescription>
            </div>
            <CalendarSearch className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <form action={savePanjikaResearch} className="grid gap-3 rounded-[24px] border border-border bg-secondary/20 p-4 md:grid-cols-2 xl:grid-cols-2">
            <input name="returnTo" type="hidden" value="/dashboard/rituals/panjika" />
            <RitualSelectField label="Tradition" name="cultureType" defaultValue="Bengali" options={cultureOptions} />
            <RitualField label="Sources (comma separated)">
              <Input name="sources" placeholder="Gupta Press, Bishuddha Siddhanta" />
            </RitualField>
            <div className="md:col-span-2">
              <RitualTextAreaField
                label="Admin instruction"
                name="adminInstruction"
                defaultValue="Select the matching tradition before importing raw calendar text."
              />
            </div>
            <div className="md:col-span-2">
              <RitualField label="Seed rituals (comma separated)">
                <Input name="sampleRituals" placeholder="Gaye Holud, Bou Bhat, Annaprashan" />
              </RitualField>
            </div>
            <FormActions className="md:col-span-2">
              <Button type="submit">Save Panjika source</Button>
            </FormActions>
          </form>

          <div className="grid gap-4 xl:grid-cols-2">
          {store.panjikaResearch.map((entry) => (
            <form action={savePanjikaResearch} className="rounded-[22px] border border-border bg-white p-4" key={entry.cultureType}>
              <input name="returnTo" type="hidden" value="/dashboard/rituals/panjika" />
              <input name="cultureType" type="hidden" value={entry.cultureType} />
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">{formatCulture(entry.cultureType)}</p>
                <Badge variant={entry.cultureType === "Bengali" ? "success" : "outline"}>{entry.sources[0]}</Badge>
              </div>
              <div className="mt-3 grid gap-3">
                <RitualField label="Sources (comma separated)">
                  <Input defaultValue={entry.sources.join(", ")} name="sources" />
                </RitualField>
                <RitualTextAreaField label="Admin instruction" name="adminInstruction" defaultValue={entry.adminInstruction} />
                <RitualField label="Seed rituals (comma separated)">
                  <Input defaultValue={entry.sampleRituals.join(", ")} name="sampleRituals" />
                </RitualField>
                <FormActions>
                  <ConfirmSubmitButton
                    confirmLabel="Delete source"
                    description="This removes the Panjika source, admin instruction, and seed ritual mapping for this tradition from the research workspace."
                    formAction={deletePanjikaResearch}
                    label="Delete source"
                    title="Delete this Panjika source?"
                  />
                  <Button type="submit">Save source</Button>
                </FormActions>
              </div>
            </form>
          ))}
          </div>
        </CardContent>
      </Card>
    </RitualPageShell>
  );
}

