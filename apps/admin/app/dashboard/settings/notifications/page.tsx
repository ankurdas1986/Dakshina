import { BellRing } from "lucide-react";
import { saveNotificationSettings } from "../../../actions/settings";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "../../../../components/ui/card";
import { FormActions } from "../../../../components/ui/form-actions";
import { Input } from "../../../../components/ui/input";
import { SettingsPageShell } from "../../../../components/settings/settings-page-shell";
import { SectionTitle } from "../../../../components/ui/section-title";
import { settingsCheckboxClassName } from "../../../../lib/settings-form-data";
import { getAdminShellData } from "../../../../lib/admin-shell-data";

export const dynamic = "force-dynamic";

export default async function NotificationSettingsPage() {
  const { settings, notificationCount } = await getAdminShellData();

  return (
    <SettingsPageShell
      activeHref="/dashboard/settings/notifications"
      subtitle="Alert scope, inbox behavior, and digest settings are isolated here so notification tuning does not clutter the main settings page."
      title="Notifications"
    >
      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <SectionTitle icon={BellRing} tone="blue">Admin inbox and digest rules</SectionTitle>
          <CardDescription>Control which operational events reach the inbox and which stay in the daily digest.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveNotificationSettings} className="space-y-3">
            <input name="returnTo" type="hidden" value="/dashboard/settings/notifications" />
            {[
              ["adminInboxEnabled", "Admin inbox enabled", "Enable the top-right notification inbox icon for operators."],
              ["registrationAlertsEnabled", "Registration alerts", "Notify admin when a new priest or user registration is submitted."],
              ["bookingAlertsEnabled", "Booking alerts", "Notify admin for confirmations, failures, replacement risks, and timing issues."],
              ["kycAlertsEnabled", "KYC alerts", "Notify admin when new priest documents or verification tasks require review."],
              ["referralAlertsEnabled", "Referral alerts", "Notify admin when referral rewards become eligible for settlement."],
              ["dailyDigestEnabled", "Daily digest", "Keep a daily summary for bookings, KYC queue, and trust operations."],
              ["whatsappAlertsEnabled", "WhatsApp alert links", "Enable WhatsApp-ready escalation links for high-priority admin alerts on the dashboard."]
            ].map(([name, label, detail]) => (
              <label className="flex items-start gap-3 rounded-[22px] border border-border bg-white p-4" key={name}>
                <input className={settingsCheckboxClassName} defaultChecked={Boolean(settings.notificationSettings[name as keyof typeof settings.notificationSettings])} name={name} type="checkbox" />
                <span>
                  <span className="block text-sm font-semibold text-foreground">{label}</span>
                  <span className="block text-sm leading-6 text-muted-foreground">{detail}</span>
                </span>
              </label>
            ))}
            <label className="grid gap-2 rounded-[22px] border border-border bg-white p-4 text-sm font-semibold text-foreground">
              <span>Super admin WhatsApp number</span>
              <Input
                className="h-11 rounded-lg"
                defaultValue={settings.notificationSettings.superAdminWhatsappNumber}
                name="superAdminWhatsappNumber"
                placeholder="+919876543210"
              />
              <span className="text-sm font-normal leading-6 text-muted-foreground">
                Used for zero-cost `wa.me` deep links from the dashboard. Keep the number in international format.
              </span>
            </label>
            <div className="rounded-[22px] border border-border bg-secondary/20 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Current unread notifications</p>
              <p className="mt-1 text-sm text-muted-foreground">Current unread count: {notificationCount}.</p>
            </div>
            <FormActions>
              <Button type="submit">Save notification settings</Button>
            </FormActions>
          </form>
        </CardContent>
      </Card>
    </SettingsPageShell>
  );
}
