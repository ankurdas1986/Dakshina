import { MapPinned } from "lucide-react";
import { saveDistrictSettings } from "../../../actions/settings";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "../../../../components/ui/card";
import { FormActions } from "../../../../components/ui/form-actions";
import { SettingsNumberField, SettingsSelectField, SettingsTextAreaField, SettingsField } from "../../../../components/settings/fields";
import { SettingsPageShell } from "../../../../components/settings/settings-page-shell";
import { SectionTitle } from "../../../../components/ui/section-title";
import { getAdminShellData } from "../../../../lib/admin-shell-data";

export const dynamic = "force-dynamic";

export default async function DistrictOverridesPage() {
  const { settings } = await getAdminShellData();

  return (
    <SettingsPageShell
      activeHref="/dashboard/settings/districts"
      subtitle="District-level overrides now live in their own workspace so zone and commission changes are easier to review and safer to edit."
      title="District overrides"
    >
      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <SectionTitle icon={MapPinned} tone="blue">District commission and zone fee overrides</SectionTitle>
          <CardDescription>Override travel fees and clusters without mixing this data into broader governance forms.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveDistrictSettings} className="space-y-3">
            <input name="returnTo" type="hidden" value="/dashboard/settings/districts" />
            {settings.districts.map((district, index) => (
              <div className="rounded-[22px] border border-border bg-white p-4" key={district.district}>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <SettingsField label="District" name={`districtName-${index}`} defaultValue={district.district} />
                  <SettingsNumberField label="Commission (%)" name={`districtCommission-${index}`} defaultValue={district.commissionPercent} />
                  <SettingsNumberField label="Zone travel fee (Rs)" name={`districtTravelFee-${index}`} defaultValue={district.zoneTravelFee} />
                  <SettingsSelectField label="Status" name={`districtStatus-${index}`} defaultValue={district.status} options={[{ value: "active", label: "active" }, { value: "review", label: "review" }]} />
                  <div className="sm:col-span-2 xl:col-span-4">
                    <SettingsTextAreaField label="Service clusters" name={`districtClusters-${index}`} defaultValue={district.serviceClusters.join(", ")} />
                  </div>
                </div>
              </div>
            ))}
            <FormActions>
              <Button type="submit">Save district overrides</Button>
            </FormActions>
          </form>
        </CardContent>
      </Card>
    </SettingsPageShell>
  );
}
