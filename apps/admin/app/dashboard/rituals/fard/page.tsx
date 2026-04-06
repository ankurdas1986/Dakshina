import { createFardRule, deleteFardRule, saveFardRule } from "../../../actions/rituals";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { ConfirmSubmitButton } from "../../../../components/ui/confirm-submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { FormActions } from "../../../../components/ui/form-actions";
import { RitualTextAreaField } from "../../../../components/rituals/fields";
import { RitualPageShell } from "../../../../components/rituals/ritual-page-shell";
import { getBookingStore } from "../../../../lib/booking-store";
import { getRitualStore } from "../../../../lib/ritual-store";

export const dynamic = "force-dynamic";

function formatCulture(value: string) {
  return value.replace("_", " ");
}

export default async function RitualFardPage() {
  const store = await getRitualStore();
  const bookingStore = await getBookingStore();

  return (
    <RitualPageShell
      activeHref="/dashboard/rituals/fard"
      subtitle="Fard policies and snapshot integrity are isolated here so operators can reason about checklist behavior without editing ritual templates at the same time."
      title="Fard rules and snapshots"
    >
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Fard operating rules</CardTitle>
            <CardDescription>Booking confirmation snapshots the ritual checklist before user delivery.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <form action={createFardRule} className="rounded-[20px] border border-border bg-secondary/20 p-4">
              <input name="returnTo" type="hidden" value="/dashboard/rituals/fard" />
              <RitualTextAreaField label="Create new Fard rule" name="rule" defaultValue="" />
              <FormActions>
                <Button type="submit">Add rule</Button>
              </FormActions>
            </form>
            {store.fardRules.map((rule, index) => (
              <form action={saveFardRule} className="rounded-[20px] border border-border bg-white p-4" key={`${index}-${rule.slice(0, 24)}`}>
                <input name="returnTo" type="hidden" value="/dashboard/rituals/fard" />
                <input name="index" type="hidden" value={index} />
                <RitualTextAreaField label={`Rule ${index + 1}`} name="rule" defaultValue={rule} />
                <FormActions>
                  <ConfirmSubmitButton
                    confirmLabel="Delete rule"
                    description="This removes the rule from the Fard operating policy list. Existing booking snapshots remain unchanged."
                    formAction={deleteFardRule}
                    label="Delete rule"
                    title="Delete this Fard rule?"
                  />
                  <Button type="submit">Save rule</Button>
                </FormActions>
              </form>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Booking Fard snapshots</CardTitle>
            <CardDescription>These examples show the booking-side checklist remains locked even if the ritual template changes later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookingStore.cases.map((booking) => (
              <div className="rounded-[20px] border border-border bg-white p-4" key={booking.id}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{booking.bookingCode} - {booking.ritual}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{formatCulture(booking.cultureType)} | Locked at {booking.fardSnapshotLockedAt || "booking confirmation"}</p>
                  </div>
                  <Badge variant="outline">{booking.fardSnapshot.deliveryMode}</Badge>
                </div>
                <div className="mt-3 space-y-2">
                  {booking.fardSnapshot.items.map((item) => (
                    <div className="flex items-center justify-between gap-3 rounded-[16px] border border-border bg-secondary/25 px-3 py-2" key={`${booking.id}-${item.label}`}>
                      <span className="text-sm text-foreground">{item.label}</span>
                      <span className="text-sm text-muted-foreground">{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </RitualPageShell>
  );
}
