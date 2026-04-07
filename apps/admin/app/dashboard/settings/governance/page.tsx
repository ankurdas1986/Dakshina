import { ShieldCheck, ToggleLeft } from "lucide-react";
import { saveControlSettings, savePlatformSettings } from "../../../actions/settings";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "../../../../components/ui/card";
import { FormActions } from "../../../../components/ui/form-actions";
import { SettingsPageShell } from "../../../../components/settings/settings-page-shell";
import { SectionTitle } from "../../../../components/ui/section-title";
import { settingsCheckboxClassName } from "../../../../lib/settings-form-data";
import { getAdminShellData } from "../../../../lib/admin-shell-data";

export const dynamic = "force-dynamic";

export default async function GovernanceSettingsPage() {
  const { settings } = await getAdminShellData();

  return (
    <SettingsPageShell
      activeHref="/dashboard/settings/governance"
      subtitle="Operational risk controls, overrides, and policy toggles stay isolated here to reduce accidental changes."
      title="Governance"
    >
      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <SectionTitle icon={ShieldCheck} tone="rose">Booking governance</SectionTitle>
            <CardDescription>High-level policy switches that directly affect booking acceptance and intervention rights.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={savePlatformSettings} className="space-y-3">
              <input name="returnTo" type="hidden" value="/dashboard/settings/governance" />
              <label className="flex items-start gap-3 rounded-[22px] border border-border bg-white p-4">
                <input className={settingsCheckboxClassName} defaultChecked={settings.platform.festivalRushBlockingEnabled} name="festivalRushBlockingEnabled" type="checkbox" />
                <span>
                  <span className="block text-sm font-semibold text-foreground">Festival rush blocking</span>
                  <span className="block text-sm leading-6 text-muted-foreground">Enable blackout-date governance for high-demand festival periods.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-[22px] border border-border bg-white p-4">
                <input className={settingsCheckboxClassName} defaultChecked={settings.platform.forceBookingOverrideEnabled} name="forceBookingOverrideEnabled" type="checkbox" />
                <span>
                  <span className="block text-sm font-semibold text-foreground">Forced booking override</span>
                  <span className="block text-sm leading-6 text-muted-foreground">Allow super admin to bypass rules for manually approved bookings.</span>
                </span>
              </label>
              <FormActions>
                <Button type="submit">Save governance rules</Button>
              </FormActions>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <SectionTitle icon={ToggleLeft} tone="amber">Policy controls</SectionTitle>
            <CardDescription>Operational feature flags for verification, reviews, replacements, and OTP completion.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveControlSettings} className="space-y-3">
              <input name="returnTo" type="hidden" value="/dashboard/settings/governance" />
              {settings.controls.map((control, index) => (
                <label className="flex items-start gap-3 rounded-[22px] border border-border bg-white p-4" key={control.label}>
                  <input className={settingsCheckboxClassName} defaultChecked={control.enabled} name={`controlEnabled-${index}`} type="checkbox" />
                  <span className="space-y-1">
                    <span className="block text-sm font-semibold text-foreground">{control.label}</span>
                    <span className="block text-sm leading-6 text-muted-foreground">{control.description}</span>
                  </span>
                </label>
              ))}
              <FormActions>
                <Button type="submit">Save policy controls</Button>
              </FormActions>
            </form>
          </CardContent>
        </Card>
      </div>
    </SettingsPageShell>
  );
}
