import Link from "next/link";
import { AlertTriangle, Clock3, RefreshCcw, Wallet } from "lucide-react";
import { saveBookingCase } from "../../actions/bookings";
import { AdminShell } from "../../../components/admin-shell";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { requireAdminUser } from "../../../lib/auth";
import { type BookingCase, getBookingMetrics, getBookingStore } from "../../../lib/booking-store";

export const dynamic = "force-dynamic";

type BookingsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const messageMap: Record<string, string> = {
  booking_saved: "Booking case updated and stored for local UAT."
};

const errorMap: Record<string, string> = {
  missing_booking_id: "Booking id is missing.",
  invalid_booking_id: "Booking id is invalid."
};

const checkboxClassName =
  "mt-1 h-4 w-4 accent-[hsl(var(--primary))] rounded border-border focus:ring-primary";

const otpStatusOptions = [
  { value: "not_issued", label: "not_issued" },
  { value: "issued", label: "issued" },
  { value: "verified", label: "verified" },
  { value: "expired", label: "expired" },
  { value: "failed", label: "failed" }
];

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function getStatusVariant(status: string, replacementRequired: boolean) {
  if (status === "completed") {
    return "success" as const;
  }

  if (replacementRequired) {
    return "secondary" as const;
  }

  return "outline" as const;
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const user = await requireAdminUser();
  const store = await getBookingStore();
  const metricsSnapshot = getBookingMetrics(store);
  const resolvedSearchParams = (await searchParams) ?? {};
  const messageKey = readParam(resolvedSearchParams, "message");
  const errorKey = readParam(resolvedSearchParams, "error");
  const selectedBookingId = readParam(resolvedSearchParams, "booking");
  const bannerMessage = messageKey ? messageMap[messageKey] ?? null : null;
  const bannerError = errorKey ? errorMap[errorKey] ?? errorKey : null;
  const activeBooking =
    store.cases.find((booking) => booking.id === selectedBookingId) ?? store.cases[0] ?? null;

  const metrics = [
    { label: "Active bookings", value: metricsSnapshot.activeBookings, icon: Clock3 },
    { label: "Advance pending", value: metricsSnapshot.paymentPending, icon: Wallet },
    { label: "Replacement cases", value: metricsSnapshot.replacementCases, icon: RefreshCcw },
    { label: "Completion pending", value: metricsSnapshot.completionPending, icon: AlertTriangle }
  ];

  return (
    <AdminShell
      active="bookings"
      subtitle="Admin manages payment checkpoints, delayed phone reveal, booking state transitions, and emergency priest replacement through a queue-first operating desk."
      title="Bookings"
      userEmail={user.email}
      subnav={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">Booking queue</Badge>
          <Badge variant="outline">Status control</Badge>
          <Badge variant="outline">Reveal timing</Badge>
          <Badge variant="outline">Replacement workflow</Badge>
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

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Live booking queue</CardTitle>
            <CardDescription>Use the queue to scan risk, replacement state, and payment readiness before opening the case workspace.</CardDescription>
          </CardHeader>
          <CardContent className="surface-scroll overflow-y-auto p-0 xl:max-h-[860px]">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[1.3fr_0.95fr_0.8fr_0.8fr_0.75fr_0.85fr_0.7fr] gap-3 border-b border-border px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                <span>Booking</span>
                <span>Status</span>
                <span>Advance</span>
                <span>Risk</span>
                <span>OTP</span>
                <span>Contact</span>
                <span className="text-right">Action</span>
              </div>
              {store.cases.map((booking) => {
                const isActive = activeBooking?.id === booking.id;

                return (
                  <Link
                    className={`grid grid-cols-[1.3fr_0.95fr_0.8fr_0.8fr_0.75fr_0.85fr_0.7fr] gap-3 border-b border-border px-5 py-4 transition-colors hover:bg-secondary/35 ${
                      isActive ? "bg-primary/5" : "bg-white"
                    }`}
                    href={`/dashboard/bookings?booking=${booking.id}`}
                    key={booking.id}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {booking.bookingCode} - {booking.ritual}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {booking.district} | {booking.eventDate}
                      </p>
                    </div>
                    <div className="flex items-start">
                      <Badge variant={getStatusVariant(booking.status, booking.replacementRequired)}>
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">{booking.advanceState}</p>
                    <p className="text-sm text-foreground">{booking.risk}</p>
                    <p className="text-sm text-foreground">{booking.completionOtpStatus}</p>
                    <p className="text-sm text-foreground">{booking.contactReveal}</p>
                    <div className="flex justify-end">
                      <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground">
                        Review
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="rounded-[28px] border-border/80 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Booking detail workspace</CardTitle>
              <CardDescription>Update the selected booking case without crowding the whole module with inline forms.</CardDescription>
            </CardHeader>
            <CardContent className="surface-scroll overflow-y-auto pr-2 xl:max-h-[860px]">
              {activeBooking ? (
                <BookingDetailPanel booking={activeBooking} statuses={store.statuses} />
              ) : (
                <div className="rounded-[24px] border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                  No booking case is available.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-border/80 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Replacement workflow policy</CardTitle>
              <CardDescription>Reassignment stays controlled and auditable in the MVP.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {store.replacementPolicy.map((item) => (
                <div className="rounded-[24px] border border-border bg-white p-4" key={item}>
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}

type BookingDetailPanelProps = {
  booking: BookingCase;
  statuses: string[];
};

function BookingDetailPanel({ booking, statuses }: BookingDetailPanelProps) {
  return (
    <form action={saveBookingCase} className="space-y-5">
      <input name="id" type="hidden" value={booking.id} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xl font-semibold text-foreground">
            {booking.bookingCode} - {booking.ritual}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {booking.district} | Event date {booking.eventDate}
          </p>
        </div>
        <Badge variant={getStatusVariant(booking.status, booking.replacementRequired)}>
          {booking.status}
        </Badge>
      </div>

      <Field label="Assigned priest">
        <Input defaultValue={booking.assignedPriest} name="assignedPriest" required />
      </Field>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SelectField
          defaultValue={booking.status}
          label="Status"
          name="status"
          options={statuses.map((status) => ({ value: status, label: status }))}
        />
        <SelectField
          defaultValue={booking.advanceState}
          label="Advance state"
          name="advanceState"
          options={[
            { value: "pending", label: "pending" },
            { value: "paid", label: "paid" },
            { value: "failed", label: "failed" },
            { value: "refunded", label: "refunded" }
          ]}
        />
        <SelectField
          defaultValue={booking.risk}
          label="Risk"
          name="risk"
          options={[
            { value: "low", label: "low" },
            { value: "medium", label: "medium" },
            { value: "high", label: "high" }
          ]}
        />
        <Field label="Contact reveal">
          <Input defaultValue={booking.contactReveal} name="contactReveal" required />
        </Field>
      </div>

      <label className="flex items-start gap-3 rounded-[20px] border border-border bg-white p-4">
        <input
          className={checkboxClassName}
          defaultChecked={booking.replacementRequired}
          name="replacementRequired"
          type="checkbox"
        />
        <span>
          <span className="block text-sm font-semibold text-foreground">Replacement required</span>
          <span className="block text-sm leading-6 text-muted-foreground">
            Keep this enabled while admin is actively handling a reassignment case.
          </span>
        </span>
      </label>

      <div className="rounded-[24px] border border-border bg-secondary/25 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Completion OTP oversight</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Admin tracks issuance, attempts, and verification before the booking can be treated as completed.
            </p>
          </div>
          <Badge variant={booking.completionOtpStatus === "verified" ? "success" : "outline"}>
            {booking.completionOtpStatus}
          </Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField
            defaultValue={booking.completionOtpStatus}
            label="OTP status"
            name="completionOtpStatus"
            options={otpStatusOptions}
          />
          <NumberField
            defaultValue={booking.completionOtpAttempts}
            label="Attempt count"
            min={0}
            name="completionOtpAttempts"
          />
          <Field label="Issued at">
            <Input defaultValue={booking.completionOtpIssuedAt} name="completionOtpIssuedAt" />
          </Field>
          <Field label="Verified at">
            <Input defaultValue={booking.completionOtpVerifiedAt} name="completionOtpVerifiedAt" />
          </Field>
          <div className="md:col-span-2">
            <TextAreaField
              defaultValue={booking.completionOtpLastEvent}
              label="OTP event note"
              name="completionOtpLastEvent"
            />
          </div>
        </div>
      </div>

      <TextAreaField label="Replacement notes" defaultValue={booking.replacementNotes} name="replacementNotes" />

      <div className="flex justify-end">
        <Button type="submit">Save booking case</Button>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

type TextAreaFieldProps = {
  label: string;
  name: string;
  defaultValue: string;
};

function TextAreaField({ label, name, defaultValue }: TextAreaFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span>{label}</span>
      <textarea
        className="min-h-28 rounded-[22px] border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        defaultValue={defaultValue}
        name={name}
      />
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
};

function SelectField({ label, name, defaultValue, options }: SelectFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span>{label}</span>
      <select
        className="h-11 rounded-[22px] border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        defaultValue={defaultValue}
        name={name}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

type NumberFieldProps = {
  label: string;
  name: string;
  defaultValue: number;
  min?: number;
};

function NumberField({ label, name, defaultValue, min = 0 }: NumberFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span>{label}</span>
      <Input defaultValue={defaultValue} min={min} name={name} type="number" />
    </label>
  );
}
