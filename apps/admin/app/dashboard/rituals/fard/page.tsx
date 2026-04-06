import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
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
            {store.fardRules.map((rule) => (
              <div className="rounded-[20px] border border-border bg-white p-4" key={rule}>
                <p className="text-sm leading-6 text-muted-foreground">{rule}</p>
              </div>
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
