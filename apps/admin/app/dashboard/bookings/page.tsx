import { AlertTriangle, Clock3, RefreshCcw, Wallet } from "lucide-react";
import { AdminShell } from "../../../components/admin-shell";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { bookingSnapshot } from "../../../lib/admin-data";
import { requireAdminUser } from "../../../lib/auth";

const metrics = [
  { label: "Active bookings", value: bookingSnapshot.totals.activeBookings, icon: Clock3 },
  { label: "Advance pending", value: bookingSnapshot.totals.paymentPending, icon: Wallet },
  { label: "Replacement cases", value: bookingSnapshot.totals.replacementCases, icon: RefreshCcw },
  { label: "Completion pending", value: bookingSnapshot.totals.completionPending, icon: AlertTriangle }
];

export default async function BookingsPage() {
  const user = await requireAdminUser();

  return (
    <AdminShell
      active="bookings"
      subtitle="Admin manages payment checkpoints, delayed phone reveal, booking status, and emergency priest replacement."
      title="Bookings"
      userEmail={user.email}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card className="rounded-[24px] border-border/80 bg-white" key={metric.label}>
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{metric.label}</p>
                  <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">{metric.value}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 p-2.5">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Live booking cases</CardTitle>
            <CardDescription>Operational visibility across risk, payment state, and contact reveal timing.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[520px] space-y-3 overflow-y-auto pr-2 surface-scroll">
            {bookingSnapshot.cases.map((booking) => (
              <div className="rounded-[24px] border border-border bg-white p-4" key={booking.bookingId}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{booking.bookingId} - {booking.ritual}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{booking.district} | Event date {booking.eventDate}</p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">Assigned priest: {booking.priest}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">Contact reveal: {booking.contactReveal}</p>
                  </div>
                  <div className="flex flex-col items-start gap-2 lg:items-end">
                    <Badge variant={booking.status === "confirmed" ? "success" : booking.status === "replacement_requested" ? "secondary" : "outline"}>
                      {booking.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground">Risk: {booking.risk}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Booking status model</CardTitle>
            <CardDescription>The current lifecycle comes from the booking rules document and PRD.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[520px] space-y-3 overflow-y-auto pr-2 surface-scroll">
            {bookingSnapshot.statuses.map((status) => (
              <div className="rounded-[20px] border border-border bg-white p-4" key={status}>
                <p className="text-sm font-semibold text-foreground">{status}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Replacement workflow policy</CardTitle>
          <CardDescription>Reassignment remains controlled and auditable in the MVP.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          {bookingSnapshot.replacementPolicy.map((item) => (
            <div className="rounded-[24px] border border-border bg-white p-4" key={item}>
              <p className="text-sm leading-6 text-muted-foreground">{item}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminShell>
  );
}

