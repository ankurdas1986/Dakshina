import { savePlatformSettings } from "../../../actions/settings";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { FormActions } from "../../../../components/ui/form-actions";
import { SettingsNumberField } from "../../../../components/settings/fields";
import { SettingsPageShell } from "../../../../components/settings/settings-page-shell";
import { getAdminShellData } from "../../../../lib/admin-shell-data";

export const dynamic = "force-dynamic";

export default async function CommercialSettingsPage() {
  const { settings } = await getAdminShellData();

  return (
    <SettingsPageShell
      activeHref="/dashboard/settings/commercial"
      subtitle="Commercial rules now live in a focused workspace so pricing and booking policy can be edited without competing with unrelated settings."
      title="Commercial rules"
    >
      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Pricing and booking economics</CardTitle>
          <CardDescription>Primary commission, advance payment, referrals, and booking window economics.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={savePlatformSettings} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SettingsNumberField label="Default commission (%)" name="defaultCommissionPercent" defaultValue={settings.platform.defaultCommissionPercent} />
            <SettingsNumberField label="Advance payment (%)" name="bookingAdvancePercent" defaultValue={settings.platform.bookingAdvancePercent} />
            <SettingsNumberField label="Referee discount (%)" name="refereeDiscountPercent" defaultValue={settings.platform.refereeDiscountPercent} />
            <SettingsNumberField label="Referrer reward (Rs)" name="referrerRewardCredit" defaultValue={settings.platform.referrerRewardCredit} />
            <SettingsNumberField label="Min booking gap (hours)" name="minBookingGapHours" defaultValue={settings.platform.minBookingGapHours} />
            <SettingsNumberField label="Max booking window (days)" name="maxBookingWindowDays" defaultValue={settings.platform.maxBookingWindowDays} />
            <div className="sm:col-span-2 xl:col-span-3">
              <FormActions>
                <Button type="submit">Save commercial settings</Button>
              </FormActions>
            </div>
          </form>
        </CardContent>
      </Card>
    </SettingsPageShell>
  );
}
