import { CalendarSearch } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { RitualPageShell } from "../../../../components/rituals/ritual-page-shell";
import { getRitualStore } from "../../../../lib/ritual-store";

export const dynamic = "force-dynamic";

function formatCulture(value: string) {
  return value.replace("_", " ");
}

export default async function RitualPanjikaPage() {
  const store = await getRitualStore();

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
        <CardContent className="grid gap-4 xl:grid-cols-2">
          {store.panjikaResearch.map((entry) => (
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
    </RitualPageShell>
  );
}
