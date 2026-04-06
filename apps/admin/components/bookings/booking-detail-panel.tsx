import type { ReactNode } from "react";
import { MessageCircleMore } from "lucide-react";
import { initiateBookingRefund, saveBookingCase } from "../../app/actions/bookings";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { FieldHint } from "../ui/field-hint";
import { FormActions } from "../ui/form-actions";
import { Input } from "../ui/input";
import type { BookingCase } from "../../lib/booking-store";
import { buildWhatsAppLink } from "../../lib/utils";

const checkboxClassName =
  "mt-1 h-4 w-4 accent-[hsl(var(--primary))] rounded border-border focus:ring-primary";

const otpStatusOptions = [
  { value: "not_issued", label: "not_issued" },
  { value: "issued", label: "issued" },
  { value: "verified", label: "verified" },
  { value: "expired", label: "expired" },
  { value: "failed", label: "failed" }
];

export function getBookingStatusVariant(status: string, replacementRequired: boolean) {
  if (status === "completed") {
    return "success" as const;
  }

  if (replacementRequired) {
    return "secondary" as const;
  }

  return "outline" as const;
}

type BookingDetailPanelProps = {
  booking: BookingCase;
  statuses: string[];
  returnTo: string;
};

export function BookingDetailPanel({ booking, statuses, returnTo }: BookingDetailPanelProps) {
  const userWaLink = buildWhatsAppLink(
    booking.userPhone,
    `Namaskar ${booking.userName}, your ${booking.bookingCode} booking for ${booking.ritual} is under admin review at Dakshina Hub.`
  );
  const priestWaLink = buildWhatsAppLink(
    "+919000000000",
    `Namaskar, admin update for booking ${booking.bookingCode} regarding ${booking.ritual}. Please review your assignment instructions in Dakshina Hub.`
  );

  return (
    <form action={saveBookingCase} className="space-y-5">
      <input name="id" type="hidden" value={booking.id} />
      <input name="returnTo" type="hidden" value={returnTo} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xl font-semibold text-foreground">{booking.bookingCode} - {booking.ritual}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {booking.cultureType.replace("_", " ")} | {booking.district} | Event date {booking.eventDate} | {booking.scheduledWindow}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">User: {booking.userName} | {booking.userPhone}</p>
        </div>
        <Badge variant={getBookingStatusVariant(booking.status, booking.replacementRequired)}>{booking.status}</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild type="button" variant="secondary">
          <a href={userWaLink} rel="noreferrer" target="_blank">
            <MessageCircleMore className="h-4 w-4 text-primary" />
            WhatsApp user
          </a>
        </Button>
        <Button asChild type="button" variant="secondary">
          <a href={priestWaLink} rel="noreferrer" target="_blank">
            <MessageCircleMore className="h-4 w-4 text-primary" />
            WhatsApp priest
          </a>
        </Button>
      </div>

      <Field label="Assigned priest">
        <Input defaultValue={booking.assignedPriest} name="assignedPriest" required />
      </Field>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SelectField defaultValue={booking.status} label="Status" name="status" options={statuses.map((status) => ({ value: status, label: status }))} />
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

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <NumberField defaultValue={booking.pricing.dakshinaAmount} label="Dakshina amount" name="dakshinaAmount" />
        <NumberField defaultValue={booking.pricing.samagriAddOns} label="Samagri add-ons" name="samagriAddOns" />
        <NumberField defaultValue={booking.pricing.zoneWiseTravelFee} label="Zone travel fee" name="zoneWiseTravelFee" />
        <NumberField defaultValue={booking.pricing.peakMultiplier} label="Peak multiplier" name="peakMultiplier" min={1} step="0.01" />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <NumberField defaultValue={booking.governance.minBookingGapHours} label="Min booking gap (hours)" name="minBookingGapHours" />
        <NumberField defaultValue={booking.governance.maxBookingWindowDays} label="Max booking window (days)" name="maxBookingWindowDays" />
        <SelectField
          defaultValue={booking.governance.whatsappConfirmationState}
          label="WhatsApp confirmation"
          name="whatsappConfirmationState"
          options={[
            { value: "not_sent", label: "not_sent" },
            { value: "sent", label: "sent" },
            { value: "failed", label: "failed" }
          ]}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex items-start gap-3 rounded-[20px] border border-border bg-white p-4">
          <input className={checkboxClassName} defaultChecked={booking.replacementRequired} name="replacementRequired" type="checkbox" />
          <span>
            <span className="block text-sm font-semibold text-foreground">Replacement required</span>
            <span className="block text-sm leading-6 text-muted-foreground">Keep this enabled while admin is actively handling a reassignment case.</span>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-[20px] border border-border bg-white p-4">
          <input className={checkboxClassName} defaultChecked={booking.governance.forcedBookingOverride} name="forcedBookingOverride" type="checkbox" />
          <span>
            <span className="block text-sm font-semibold text-foreground">Forced booking override</span>
            <span className="block text-sm leading-6 text-muted-foreground">Use only when super admin needs to bypass booking governance.</span>
          </span>
        </label>
      </div>

      <div className="rounded-[24px] border border-border bg-secondary/25 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Completion OTP oversight</p>
            <p className="text-sm leading-6 text-muted-foreground">Admin tracks issuance, attempts, and verification before the booking can be treated as completed.</p>
          </div>
          <Badge variant={booking.completionOtpStatus === "verified" ? "success" : "outline"}>{booking.completionOtpStatus}</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField defaultValue={booking.completionOtpStatus} label="OTP status" name="completionOtpStatus" options={otpStatusOptions} />
          <NumberField defaultValue={booking.completionOtpAttempts} label="Attempt count" min={0} name="completionOtpAttempts" />
          <Field label="Issued at"><Input defaultValue={booking.completionOtpIssuedAt} name="completionOtpIssuedAt" /></Field>
          <Field label="Verified at"><Input defaultValue={booking.completionOtpVerifiedAt} name="completionOtpVerifiedAt" /></Field>
          <div className="md:col-span-2"><TextAreaField defaultValue={booking.completionOtpLastEvent} label="OTP event note" name="completionOtpLastEvent" /></div>
        </div>
      </div>

      <div className="rounded-[24px] border border-border bg-secondary/25 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Policy snapshot and refund intelligence</p>
            <p className="text-sm leading-6 text-muted-foreground">Refund decisions stay locked to the booking snapshot captured at confirmation time.</p>
          </div>
          <Badge variant={booking.pendingRefundAmount > 0 ? "secondary" : "outline"}>{booking.refundState}</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[20px] border border-border bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Captured policy</p>
            <p className="mt-2 text-sm text-foreground">Advance {booking.policySnapshot.advancePaymentPercent}%</p>
            <p className="mt-1 text-sm text-muted-foreground">72h+ refund: {booking.policySnapshot.refundRules.moreThan72HoursPercent}%</p>
            <p className="mt-1 text-sm text-muted-foreground">24-72h refund: {booking.policySnapshot.refundRules.between24And72HoursPercent}%</p>
            <p className="mt-1 text-sm text-muted-foreground">&lt;24h refund: {booking.policySnapshot.refundRules.lessThan24HoursPercent}%</p>
          </div>
          <div className="rounded-[20px] border border-border bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Pending refund</p>
            <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">Rs {booking.pendingRefundAmount}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {booking.refundReason || "No refund has been initiated yet."}
            </p>
            <FormActions className="justify-start pt-4">
              <button
                className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
                formAction={initiateBookingRefund}
                type="submit"
              >
                Initiate refund
              </button>
            </FormActions>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Manual Razorpay mode: calculate from snapshot, process the refund in Razorpay, then store the reference in admin notes or payment logs.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-border bg-secondary/25 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Fard snapshot</p>
            <p className="text-sm leading-6 text-muted-foreground">This checklist is locked to the booking. Ritual template edits must not rewrite this historical snapshot.</p>
          </div>
          <Badge variant="outline">{booking.fardSnapshot.deliveryMode}</Badge>
        </div>
        <div className="rounded-[20px] border border-border bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Locked at {booking.fardSnapshotLockedAt || "booking confirmation"}</p>
          <div className="mt-3 space-y-2">
            {booking.fardSnapshot.items.map((item) => (
              <div className="flex items-center justify-between gap-3 rounded-[16px] border border-border bg-secondary/30 px-3 py-2" key={`${item.label}-${item.quantity}`}>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <span className="text-sm text-muted-foreground">{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[20px] border border-border bg-white p-4 text-sm text-muted-foreground">
        <div className="mb-2 flex items-center gap-2 text-foreground">
          <MessageCircleMore className="h-4 w-4 text-primary" />
          <span className="font-semibold">Manual WhatsApp confirmation</span>
        </div>
        <p>Current state: {booking.governance.whatsappConfirmationState}. This field tracks whether the admin-triggered booking confirmation message has been sent.</p>
      </div>

      <TextAreaField label="Replacement notes" defaultValue={booking.replacementNotes} name="replacementNotes" />

      <FormActions>
        <Button type="submit">Save booking case</Button>
      </FormActions>
    </form>
  );
}

type FieldProps = {
  label: string;
  children: ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span className="flex items-start justify-between gap-2"><span className="min-w-0">{label}</span><FieldHint label={label} className="shrink-0" /></span>
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
      <span className="flex items-start justify-between gap-2"><span className="min-w-0">{label}</span><FieldHint label={label} className="shrink-0" /></span>
      <textarea className="min-h-28 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue={defaultValue} name={name} />
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
      <span className="flex items-start justify-between gap-2"><span className="min-w-0">{label}</span><FieldHint label={label} className="shrink-0" /></span>
      <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue={defaultValue} name={name}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
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
  step?: string;
};

function NumberField({ label, name, defaultValue, min = 0, step = '1' }: NumberFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span className="flex items-start justify-between gap-2"><span className="min-w-0">{label}</span><FieldHint label={label} className="shrink-0" /></span>
      <Input defaultValue={defaultValue} min={min} name={name} step={step} type="number" />
    </label>
  );
}
