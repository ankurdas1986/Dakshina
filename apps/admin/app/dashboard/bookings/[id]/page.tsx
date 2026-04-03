import Link from "next/link";
import { ChevronLeft, ShieldAlert, Wallet } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminShell } from "../../../../components/admin-shell";
import { BookingDetailPanel, getBookingStatusVariant } from "../../../../components/bookings/booking-detail-panel";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { getAdminShellData } from "../../../../lib/admin-shell-data";
import { requireAdminUser } from "../../../../lib/auth";
import { getBookingStore } from "../../../../lib/booking-store";

export const dynamic = "force-dynamic";

type BookingDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const messageMap: Record<string, string> = {
  booking_saved: "Booking case updated and stored for local UAT."
};

const errorMap: Record<string, string> = {
  missing_booking_id: "Booking id is missing.",
  invalid_booking_id: "Booking id is invalid."
};

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function BookingDetailPage({ params, searchParams }: BookingDetailPageProps) {
  const user = await requireAdminUser();
  const { notifications, notificationCount, notificationEnabled } = await getAdminShellData();
  const { id } = await params;
  const store = await getBookingStore();
  const booking = store.cases.find((item) => item.id === id);

  if (!booking) {
    notFound();
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const messageKey = readParam(resolvedSearchParams, "message");
  const errorKey = readParam(resolvedSearchParams, "error");
  const bannerMessage = messageKey ? messageMap[messageKey] ?? null : null;
  const bannerError = errorKey ? errorMap[errorKey] ?? errorKey : null;

  return (
    <AdminShell
      active="bookings"
      notificationCount={notificationCount}
      notificationEnabled={notificationEnabled}
      notifications={notifications}
      breadcrumbs={
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link className="inline-flex items-center gap-2 font-medium text-foreground hover:text-primary" href="/dashboard/bookings">
            <ChevronLeft className="h-4 w-4" />
            Back to booking queue
          </Link>
          <span>/</span>
          <span>{booking.bookingCode}</span>
        </div>
      }
      subtitle="Dedicated case page for booking state, replacement handling, delayed contact reveal, and completion OTP controls."
      title="Booking Case"
      userEmail={user.email}
      subnav={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={getBookingStatusVariant(booking.status, booking.replacementRequired)}>{booking.status}</Badge>
          <Badge variant="outline">Advance {booking.advanceState}</Badge>
          <Badge variant="outline">OTP {booking.completionOtpStatus}</Badge>
          <Badge variant="outline">Risk {booking.risk}</Badge>
        </div>
      }
    >
      {bannerMessage ? (
        <div className="rounded-[24px] border border-success/20 bg-success/10 px-4 py-3 text-sm font-medium text-success">
          {bannerMessage}
        </div>
      ) : null}
      {bannerError ? (
        <div className="rounded-[24px] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {bannerError}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Operational summary</CardTitle>
            <CardDescription>Review the booking state before making payment, replacement, or OTP decisions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] border border-border bg-secondary/30 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Ritual</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{booking.ritual}</p>
              <p className="mt-1 text-sm text-muted-foreground">{booking.district} | {booking.eventDate}</p>
            </div>
            <div className="rounded-[24px] border border-border bg-secondary/30 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Wallet className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Advance checkpoint</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">Advance state is {booking.advanceState}. Contact reveal remains {booking.contactReveal} until the commercial rules allow release.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] border border-border bg-secondary/30 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldAlert className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Risk handling</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">Risk is {booking.risk}. Replacement is {booking.replacementRequired ? "active" : "not active"}. Use the detail workspace to complete the case resolution.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Detail workspace</CardTitle>
            <CardDescription>All operational edits for this booking case live here.</CardDescription>
          </CardHeader>
          <CardContent className="surface-scroll overflow-y-auto pr-2 xl:max-h-[980px]">
            <BookingDetailPanel booking={booking} returnTo={`/dashboard/bookings/${booking.id}`} statuses={store.statuses} />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
