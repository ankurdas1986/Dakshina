import { Globe2, LibraryBig } from "lucide-react";
import { savePlatformSettings } from "../../../actions/settings";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "../../../../components/ui/card";
import { FormActions } from "../../../../components/ui/form-actions";
import { SettingsField, SettingsNumberField, SettingsSelectField } from "../../../../components/settings/fields";
import { SettingsPageShell } from "../../../../components/settings/settings-page-shell";
import { SectionTitle } from "../../../../components/ui/section-title";
import { getAdminShellData } from "../../../../lib/admin-shell-data";
import { settingsCultureOptions } from "../../../../lib/settings-form-data";

export const dynamic = "force-dynamic";

export default async function CultureSettingsPage() {
  const { settings } = await getAdminShellData();

  return (
    <SettingsPageShell
      activeHref="/dashboard/settings/culture"
      subtitle="Launch order, cultural readiness, and Panjika context live here. Bengali stays first without hardcoding the rest out of the platform."
      title="Culture rollout"
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <SectionTitle icon={Globe2} tone="amber">Culture launch controls</SectionTitle>
                <CardDescription>Set the operating default and launch geography without mixing in all other commercial rules.</CardDescription>
              </div>
              <Badge variant="success">Launch policy</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <form action={savePlatformSettings} className="grid gap-4 sm:grid-cols-2">
              <input name="returnTo" type="hidden" value="/dashboard/settings/culture" />
              <SettingsSelectField label="Default culture" name="defaultCulture" defaultValue={settings.platform.defaultCulture} options={settingsCultureOptions} />
              <SettingsField label="Launch cluster" name="launchRegion" defaultValue={settings.platform.launchRegion} />
              <SettingsField label="Currency" name="currency" defaultValue={settings.platform.currency} />
              <SettingsNumberField label="Reveal window min (hours)" name="revealWindowMin" defaultValue={settings.platform.revealWindowHours.min} />
              <SettingsNumberField label="Reveal window max (hours)" name="revealWindowMax" defaultValue={settings.platform.revealWindowHours.max} />
              <div className="sm:col-span-2">
                <FormActions>
                  <Button type="submit">Save culture rollout</Button>
                </FormActions>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <SectionTitle icon={LibraryBig} tone="violet">Supported traditions and sources</SectionTitle>
            <CardDescription>Keep cultural source research visible without embedding it inside one long settings page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {settings.cultureResearch.map((culture) => (
              <div className="rounded-[22px] border border-border bg-white p-4" key={culture.cultureType}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{culture.cultureType.replace("_", " ")}</p>
                  <Badge variant={culture.isLaunchPriority ? "success" : "outline"}>{culture.isLaunchPriority ? "Launch priority" : "Supported"}</Badge>
                </div>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Sources</p>
                <p className="mt-1 text-sm text-foreground">{culture.sources.join(" / ")}</p>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Sample rituals</p>
                <p className="mt-1 text-sm text-muted-foreground">{culture.sampleRituals.join(", ")}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SettingsPageShell>
  );
}
