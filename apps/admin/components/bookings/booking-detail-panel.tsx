import type { ReactNode } from "react";
import { saveBookingCase } from "../../app/actions/bookings";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { BookingCase } from "../../lib/booking-store";

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
  return (
    <form action={saveBookingCase} className="space-y-5">
      <input name="id" type="hidden" value={booking.id} />
      <input name="returnTo" type="hidden" value={returnTo} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xl font-semibold text-foreground">
            {booking.bookingCode} - {booking.ritual}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {booking.district} | Event date {booking.eventDate}
          </p>
        </div>
        <Badge variant={getBookingStatusVariant(booking.status, booking.replacementRequired)}>
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

      <div className="rounded-[24px] border border-border bg-secondary/25 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Fard snapshot</p>
            <p className="text-sm leading-6 text-muted-foreground">
              This checklist is locked to the booking. Ritual template edits must not rewrite this historical snapshot.
            </p>
          </div>
          <Badge variant="outline">{booking.fardSnapshot.deliveryMode}</Badge>
        </div>
        <div className="rounded-[20px] border border-border bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Locked at {booking.fardSnapshotLockedAt || "booking confirmation"}
          </p>
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

      <TextAreaField label="Replacement notes" defaultValue={booking.replacementNotes} name="replacementNotes" />

      <div className="flex justify-end">
        <Button type="submit">Save booking case</Button>
      </div>
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
        className="min-h-28 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
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
        className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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

