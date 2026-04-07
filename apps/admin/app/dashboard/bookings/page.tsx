import Link from "next/link";
import { CalendarRange, Clock3, MessageCircleMore, PlusCircle, RefreshCcw, Search, ShieldAlert, Wallet } from "lucide-react";
import { createBookingCase } from "../../actions/bookings";
import { getBookingStatusVariant } from "../../../components/bookings/booking-detail-panel";
import { AdminShell } from "../../../components/admin-shell";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "../../../components/ui/card";
import { FormActions } from "../../../components/ui/form-actions";
import { DateInput } from "../../../components/ui/date-input";
import { Input } from "../../../components/ui/input";
import { KpiCard } from "../../../components/ui/kpi-card";
import { SectionTitle } from "../../../components/ui/section-title";
import { TimeRangePicker } from "../../../components/ui/time-range-picker";
import { getAdminShellData } from "../../../lib/admin-shell-data";
import { requireAdminUser } from "../../../lib/auth";
import { getBookingMetrics, getBookingStore } from "../../../lib/booking-store";
import type { CultureType } from "../../../lib/settings";

export const dynamic = "force-dynamic";

type BookingsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const messageMap: Record<string, string> = {
  booking_saved: "Booking case updated and stored for local UAT.",
  refund_initiated: "Refund amount calculated from the booking snapshot. Complete the manual Razorpay refund and store the reference.",
  booking_created: "Manual booking created and added to the operations queue."
};

const errorMap: Record<string, string> = {
  missing_booking_id: "Booking id is missing.",
  invalid_booking_id: "Booking id is invalid."
};

const cultureOptions: Array<{ value: string; label: string }> = [
  { value: "all", label: "All cultures" },
  { value: "Bengali", label: "Bengali" },
  { value: "North_Indian", label: "North Indian" },
  { value: "Marwadi", label: "Marwadi" },
  { value: "Odia", label: "Odia" },
  { value: "Gujarati", label: "Gujarati" }
];

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const user = await requireAdminUser();
  const { notifications, notificationCount, notificationEnabled } = await getAdminShellData();
  const store = await getBookingStore();
  const metricsSnapshot = getBookingMetrics(store);
  const resolvedSearchParams = (await searchParams) ?? {};
  const messageKey = readParam(resolvedSearchParams, "message");
  const errorKey = readParam(resolvedSearchParams, "error");
  const bannerMessage = messageKey ? messageMap[messageKey] ?? null : null;
  const bannerError = errorKey ? errorMap[errorKey] ?? errorKey : null;
  const query = readParam(resolvedSearchParams, "q")?.toLowerCase() ?? "";
  const statusFilter = readParam(resolvedSearchParams, "status") ?? "all";
  const riskFilter = readParam(resolvedSearchParams, "risk") ?? "all";
  const replacementFilter = readParam(resolvedSearchParams, "replacement") ?? "all";
  const cultureFilter = readParam(resolvedSearchParams, "culture") ?? "all";

  const filteredBookings = store.cases.filter((booking) => {
    const matchesQuery =
      !query ||
      [booking.bookingCode, booking.ritual, booking.district, booking.assignedPriest, booking.cultureType, booking.userName]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesRisk = riskFilter === "all" || booking.risk === riskFilter;
    const matchesReplacement = replacementFilter === "all" || (replacementFilter === "required" ? booking.replacementRequired : !booking.replacementRequired);
    const matchesCulture = cultureFilter === "all" || booking.cultureType === (cultureFilter as CultureType);

    return matchesQuery && matchesStatus && matchesRisk && matchesReplacement && matchesCulture;
  });

  const metrics = [
    { label: "Active bookings", value: metricsSnapshot.activeBookings, icon: Clock3 },
    { label: "Advance pending", value: metricsSnapshot.paymentPending, icon: Wallet },
    { label: "Replacement cases", value: metricsSnapshot.replacementCases, icon: RefreshCcw },
    { label: "Refund cases", value: metricsSnapshot.refundCases, icon: CalendarRange }
  ];

  return (
    <AdminShell
      active="bookings"
      notificationCount={notificationCount}
      notificationEnabled={notificationEnabled}
      notifications={notifications}
      subtitle="Use the booking queue to triage culture fit, pricing, governance, replacement risk, and OTP status. Open a case to handle the full workflow in a dedicated detail page."
      title="Bookings"
      userEmail={user.email}
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
          const detail =
            metric.label === "Active bookings"
              ? "Live operational booking load currently moving through the marketplace."
              : metric.label === "Payment pending"
                ? "Bookings still waiting on wallet or advance payment action."
                : metric.label === "Replacement cases"
                  ? "Cases needing reassignment or intervention before ritual completion."
                  : "Bookings waiting for final OTP-based completion closure.";
          const tone = metric.label === "Replacement cases" ? "rose" : metric.label === "Payment pending" ? "amber" : metric.label === "Completion pending" ? "violet" : "blue";
          return <KpiCard detail={detail} icon={Icon} key={metric.label} label={metric.label} tone={tone} value={metric.value} />;
        })}
      </div>

      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <SectionTitle icon={PlusCircle} tone="amber">Create manual booking</SectionTitle>
              <CardDescription>Use this for super-admin forced bookings, support-assisted orders, and offline capture before payment collection.</CardDescription>
            </div>
            <PlusCircle className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <form action={createBookingCase} className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            <Input className="h-11 rounded-lg" name="bookingCode" placeholder="Booking code (optional)" />
            <Input className="h-11 rounded-lg" name="userName" placeholder="User name" required />
            <Input className="h-11 rounded-lg" name="userPhone" placeholder="User phone" required />
            <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground" defaultValue="Bengali" name="cultureType">
              {cultureOptions.filter((option) => option.value !== "all").map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <Input className="h-11 rounded-lg" name="ritual" placeholder="Ritual" required />
            <Input className="h-11 rounded-lg" name="district" placeholder="District" required />
            <DateInput name="eventDate" />
            <TimeRangePicker name="scheduledWindow" />
            <Input className="h-11 rounded-lg" name="assignedPriest" placeholder="Assigned priest" />
            <Input className="h-11 rounded-lg" min={0} name="dakshinaAmount" placeholder="Dakshina amount" type="number" />
            <Input className="h-11 rounded-lg" min={0} name="samagriAddOns" placeholder="Samagri add-ons" type="number" />
            <Input className="h-11 rounded-lg" min={0} name="zoneWiseTravelFee" placeholder="Zone travel fee" type="number" />
            <Input className="h-11 rounded-lg" min={1} name="peakMultiplier" placeholder="Peak multiplier" step="0.01" type="number" />
            <Input className="h-11 rounded-lg" min={1} name="minBookingGapHours" placeholder="Min booking gap (hours)" type="number" />
            <Input className="h-11 rounded-lg" min={1} name="maxBookingWindowDays" placeholder="Max booking window (days)" type="number" />
            <label className="flex items-start gap-3 rounded-[20px] border border-border bg-white p-4 xl:col-span-3">
              <input className="mt-1 h-4 w-4 rounded border-border accent-[hsl(var(--primary))] focus:ring-primary" name="forcedBookingOverride" type="checkbox" />
              <span>
                <span className="block text-sm font-semibold text-foreground">Forced booking override</span>
                <span className="block text-sm leading-6 text-muted-foreground">Use when super admin needs to bypass booking governance rules.</span>
              </span>
            </label>
            <FormActions className="lg:col-span-2 xl:col-span-3">
              <Button type="submit">Create booking</Button>
            </FormActions>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader className="space-y-4">
          <div>
            <SectionTitle icon={CalendarRange} tone="blue">Booking operations queue</SectionTitle>
            <CardDescription>Table-first workflow. Keep the queue dense here and move into a dedicated case page to edit the booking.</CardDescription>
          </div>
          <form className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_0.9fr_0.85fr_0.95fr_0.95fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-11 rounded-lg pl-9" defaultValue={query} name="q" placeholder="Search booking, ritual, district, priest..." />
            </label>
            <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground" defaultValue={cultureFilter} name="culture">
              {cultureOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground" defaultValue={statusFilter} name="status">
              <option value="all">All statuses</option>
              {store.statuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground" defaultValue={riskFilter} name="risk">
              <option value="all">All risk</option>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
            <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground" defaultValue={replacementFilter} name="replacement">
              <option value="all">All replacement states</option>
              <option value="required">replacement required</option>
              <option value="clear">no replacement</option>
            </select>
            <Button className="h-11 rounded-lg" type="submit">Apply</Button>
          </form>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3 p-4 xl:hidden">
            {filteredBookings.length ? filteredBookings.map((booking) => (
              <Link
                className="block rounded-[24px] border border-border bg-white p-4 transition-colors hover:bg-secondary/35"
                href={`/dashboard/bookings/${booking.id}`}
                key={booking.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{booking.bookingCode} - {booking.ritual}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{booking.district} | {booking.eventDate}</p>
                  </div>
                  <Badge variant={getBookingStatusVariant(booking.status, booking.replacementRequired)}>{booking.status}</Badge>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[18px] border border-border bg-secondary/20 px-3 py-2.5 text-sm">
                    <p className="font-semibold text-foreground">{booking.cultureType.replace("_", " ")}</p>
                    <p className="mt-1 text-muted-foreground">Rs {booking.pricing.dakshinaAmount + booking.pricing.samagriAddOns + booking.pricing.zoneWiseTravelFee}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Peak x{booking.pricing.peakMultiplier}</p>
                  </div>
                  <div className="rounded-[18px] border border-border bg-secondary/20 px-3 py-2.5 text-sm">
                    <p className="font-semibold text-foreground">{booking.assignedPriest}</p>
                    <p className="mt-1 text-muted-foreground">Advance {booking.advanceState}</p>
                    <p className="mt-1 text-xs text-muted-foreground">OTP {booking.completionOtpStatus}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border px-2.5 py-1">Risk {booking.risk}</span>
                  <span className="rounded-full border border-border px-2.5 py-1">Contact {booking.contactReveal}</span>
                  <span className="rounded-full border border-border px-2.5 py-1">{booking.governance.whatsappConfirmationState}</span>
                </div>
              </Link>
            )) : (
              <div className="rounded-[24px] border border-border bg-white px-4 py-10 text-center text-sm text-muted-foreground">No bookings match the current filters.</div>
            )}
          </div>
          <div className="hidden overflow-x-auto xl:block">
          <div className="min-w-[1260px]">
            <div className="grid grid-cols-[1.3fr_0.95fr_1fr_0.95fr_0.85fr_0.95fr_0.75fr_0.7fr] gap-3 border-b border-border px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              <span>Booking</span>
              <span>Status</span>
              <span>Culture / pricing</span>
              <span>Governance</span>
              <span>OTP</span>
              <span>WhatsApp / contact</span>
              <span>Priest</span>
              <span className="text-right">Action</span>
            </div>
            {filteredBookings.length ? filteredBookings.map((booking) => (
              <Link
                className="grid grid-cols-[1.3fr_0.95fr_1fr_0.95fr_0.85fr_0.95fr_0.75fr_0.7fr] gap-3 border-b border-border px-5 py-4 transition-colors hover:bg-secondary/35"
                href={`/dashboard/bookings/${booking.id}`}
                key={booking.id}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{booking.bookingCode} - {booking.ritual}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{booking.district} | {booking.eventDate}</p>
                </div>
                <div className="flex items-start"><Badge variant={getBookingStatusVariant(booking.status, booking.replacementRequired)}>{booking.status}</Badge></div>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-foreground">{booking.cultureType.replace("_", " ")}</p>
                  <p className="text-muted-foreground">Rs {booking.pricing.dakshinaAmount + booking.pricing.samagriAddOns + booking.pricing.zoneWiseTravelFee}</p>
                  <p className="text-xs text-muted-foreground">Peak x{booking.pricing.peakMultiplier}</p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-foreground">Gap {booking.governance.minBookingGapHours}h</p>
                  <p className="text-muted-foreground">Window {booking.governance.maxBookingWindowDays}d</p>
                  {booking.governance.forcedBookingOverride ? <Badge variant="outline">Force override</Badge> : null}
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-foreground">{booking.completionOtpStatus}</p>
                  <p className="text-muted-foreground">Advance {booking.advanceState}</p>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-1.5 text-foreground">
                    <MessageCircleMore className="h-3.5 w-3.5 text-primary" />
                    <span>{booking.governance.whatsappConfirmationState}</span>
                  </div>
                  <p className="text-muted-foreground">Contact {booking.contactReveal}</p>
                </div>
                <p className="truncate text-sm text-foreground">{booking.assignedPriest}</p>
                <div className="flex justify-end"><span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground">Open</span></div>
              </Link>
            )) : (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">No bookings match the current filters.</div>
            )}
          </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <SectionTitle icon={ShieldAlert} tone="rose">Replacement workflow policy</SectionTitle>
          <CardDescription>Reassignment remains controlled and auditable in the MVP. The queue handles triage, the detail page handles execution.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {store.replacementPolicy.map((item) => (
            <div className="rounded-[24px] border border-border bg-white p-4" key={item}>
              <p className="text-sm leading-6 text-muted-foreground">{item}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminShell>
  );
}



