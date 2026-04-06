import { savePanjikaResearch, deletePanjikaResearch } from "../../../actions/rituals";
import { CalendarSearch } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { FormActions } from "../../../../components/ui/form-actions";
import { Input } from "../../../../components/ui/input";
import { RitualField, RitualSelectField, RitualTextAreaField } from "../../../../components/rituals/fields";
import { RitualPageShell } from "../../../../components/rituals/ritual-page-shell";
import { getRitualStore } from "../../../../lib/ritual-store";

export const dynamic = "force-dynamic";

function formatCulture(value: string) {
  return value.replace("_", " ");
}

export default async function RitualPanjikaPage() {
  const store = await getRitualStore();
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
      subtitle="Research sources and import context are isolated here so cultural calendar management stays readable and operationally clear."
      title="Panjika sources"
    >
      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Smart Panjika import workspace</CardTitle>
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
                  <button
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-destructive/30 px-4 text-sm font-semibold text-destructive transition hover:bg-destructive/5"
                    formAction={deletePanjikaResearch}
                    type="submit"
                  >
                    Delete source
                  </button>
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
