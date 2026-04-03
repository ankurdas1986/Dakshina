import { AlertTriangle, Clock3, RefreshCcw, Wallet } from "lucide-react";
import { saveBookingCase } from "../../actions/bookings";
import { AdminShell } from "../../../components/admin-shell";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { requireAdminUser } from "../../../lib/auth";
import { getBookingMetrics, getBookingStore } from "../../../lib/booking-store";

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

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const user = await requireAdminUser();
  const store = await getBookingStore();
  const metricsSnapshot = getBookingMetrics(store);
  const resolvedSearchParams = (await searchParams) ?? {};
  const messageKey = readParam(resolvedSearchParams, "message");
  const errorKey = readParam(resolvedSearchParams, "error");
  const bannerMessage = messageKey ? messageMap[messageKey] ?? null : null;
  const bannerError = errorKey ? errorMap[errorKey] ?? errorKey : null;

  const metrics = [
    { label: "Active bookings", value: metricsSnapshot.activeBookings, icon: Clock3 },
    { label: "Advance pending", value: metricsSnapshot.paymentPending, icon: Wallet },
    { label: "Replacement cases", value: metricsSnapshot.replacementCases, icon: RefreshCcw },
    { label: "Completion pending", value: metricsSnapshot.completionPending, icon: AlertTriangle }
  ];

  return (
    <AdminShell
      active="bookings"
      subtitle="Admin manages payment checkpoints, delayed phone reveal, booking state transitions, and emergency priest replacement."
      title="Bookings"
      userEmail={user.email}
      subnav={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">Status control</Badge>
          <Badge variant="outline">Advance state</Badge>
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

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Live booking cases</CardTitle>
            <CardDescription>Each case remains editable for status, replacement, and contact reveal operations.</CardDescription>
          </CardHeader>
          <CardContent className="surface-scroll max-h-[860px] space-y-4 overflow-y-auto pr-2">
            {store.cases.map((booking) => (
              <form action={saveBookingCase} className="rounded-[24px] border border-border bg-white p-4" key={booking.id}>
                <input name="id" type="hidden" value={booking.id} />
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-foreground">{booking.bookingCode} - {booking.ritual}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{booking.district} | Event date {booking.eventDate}</p>
                  </div>
                  <Badge variant={booking.status === "completed" ? "success" : booking.replacementRequired ? "secondary" : "outline"}>
                    {booking.status}
                  </Badge>
                </div>

                <div className="grid gap-3">
                  <Field label="Assigned priest">
                    <Input defaultValue={booking.assignedPriest} name="assignedPriest" required />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <SelectField
                      defaultValue={booking.status}
                      label="Status"
                      name="status"
                      options={store.statuses.map((status) => ({ value: status, label: status }))}
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
                      className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      defaultChecked={booking.replacementRequired}
                      name="replacementRequired"
                      type="checkbox"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-foreground">Replacement required</span>
                      <span className="block text-sm leading-6 text-muted-foreground">Keep this enabled while admin is actively handling a reassignment case.</span>
                    </span>
                  </label>
                  <TextAreaField label="Replacement notes" defaultValue={booking.replacementNotes} name="replacementNotes" />
                  <div className="flex justify-end">
                    <Button type="submit">Save booking case</Button>
                  </div>
                </div>
              </form>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="rounded-[28px] border-border/80 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Booking status model</CardTitle>
              <CardDescription>This lifecycle comes from the booking rules document and PRD.</CardDescription>
            </CardHeader>
            <CardContent className="surface-scroll max-h-[420px] space-y-3 overflow-y-auto pr-2">
              {store.statuses.map((status) => (
                <div className="rounded-[20px] border border-border bg-white p-4" key={status}>
                  <p className="text-sm font-semibold text-foreground">{status}</p>
                </div>
              ))}
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
