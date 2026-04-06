import type { ReactNode } from "react";
import Link from "next/link";
import { History, MessageCircleMore, Shield, Wallet } from "lucide-react";
import { saveUserRecord } from "../../app/actions/users";
import type { BookingCase } from "../../lib/booking-store";
import type { UserRecord } from "../../lib/user-store";
import type { WalletTransaction } from "../../lib/wallet-store";
import { buildWhatsAppLink } from "../../lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { FieldHint } from "../ui/field-hint";
import { FormActions } from "../ui/form-actions";
import { Input } from "../ui/input";

type UserDetailPanelProps = {
  user: UserRecord;
  bookingHistory: BookingCase[];
  transactionLogs: WalletTransaction[];
  returnTo: string;
};

export function getUserStatusVariant(status: UserRecord["accountStatus"]) {
  if (status === "active") {
    return "success" as const;
  }

  if (status === "blocked") {
    return "secondary" as const;
  }

  return "outline" as const;
}

export function UserDetailPanel({ user, bookingHistory, transactionLogs, returnTo }: UserDetailPanelProps) {
  const userWaLink = buildWhatsAppLink(
    user.phone,
    `Namaskar ${user.fullName}, this is Dakshina Hub admin support regarding your account and booking activity.`
  );

  return (
    <form action={saveUserRecord} className="space-y-5">
      <input name="id" type="hidden" value={user.id} />
      <input name="returnTo" type="hidden" value={returnTo} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xl font-semibold text-foreground">{user.fullName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {user.locality}, {user.district} | Prefers {user.traditionPreference.replace("_", " ")}
          </p>
        </div>
        <Badge variant={getUserStatusVariant(user.accountStatus)}>{user.accountStatus}</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild type="button" variant="secondary">
          <a href={userWaLink} rel="noreferrer" target="_blank">
            <MessageCircleMore className="h-4 w-4 text-primary" />
            WhatsApp user
          </a>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Full name"><Input defaultValue={user.fullName} name="fullName" required /></Field>
        <Field label="Email"><Input defaultValue={user.email} name="email" required /></Field>
        <Field label="Phone"><Input defaultValue={user.phone} name="phone" required /></Field>
        <Field label="Wallet balance (Rs)"><Input defaultValue={user.walletBalance} min={0} name="walletBalance" type="number" /></Field>
        <Field label="District"><Input defaultValue={user.district} name="district" required /></Field>
        <Field label="Locality"><Input defaultValue={user.locality} name="locality" required /></Field>
        <SelectField
          label="Tradition preference"
          name="traditionPreference"
          defaultValue={user.traditionPreference}
          options={["Bengali", "North_Indian", "Marwadi", "Odia", "Gujarati"]}
        />
        <SelectField label="Account status" name="accountStatus" defaultValue={user.accountStatus} options={["active", "blocked", "deactivated"]} />
        <div className="md:col-span-2">
          <TextAreaField label="Address" name="address" defaultValue={user.address} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[24px] border border-border bg-secondary/20 p-4">
          <div className="mb-3 flex items-center gap-2 text-foreground">
            <History className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Booking history</p>
          </div>
          <div className="space-y-2">
            {bookingHistory.length ? bookingHistory.map((booking) => (
              <Link className="block rounded-[18px] border border-border bg-white px-3 py-3" href={`/dashboard/bookings/${booking.id}`} key={booking.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{booking.bookingCode}</p>
                  <Badge variant="outline">{booking.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{booking.ritual} | {booking.eventDate}</p>
              </Link>
            )) : (
              <div className="rounded-[18px] border border-border bg-white px-3 py-4 text-sm text-muted-foreground">No bookings linked yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-border bg-secondary/20 p-4">
          <div className="mb-3 flex items-center gap-2 text-foreground">
            <Wallet className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Transaction log</p>
          </div>
          <div className="space-y-2">
            {transactionLogs.length ? transactionLogs.map((entry) => (
              <div className="rounded-[18px] border border-border bg-white px-3 py-3" key={entry.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{entry.type.replaceAll("_", " ")}</p>
                  <Badge variant={entry.direction === "credit" ? "success" : "outline"}>
                    {entry.direction} Rs {entry.amount}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">{entry.createdAt}</p>
              </div>
            )) : (
              <div className="rounded-[18px] border border-border bg-white px-3 py-4 text-sm text-muted-foreground">No wallet transactions recorded.</div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-border bg-secondary/20 p-4">
        <div className="mb-3 flex items-center gap-2 text-foreground">
          <Shield className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Admin notes</p>
        </div>
        <TextAreaField label="Internal note" name="notes" defaultValue={user.notes} />
      </div>

      <FormActions>
        <Button type="submit">Save user record</Button>
      </FormActions>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span className="flex items-start justify-between gap-2"><span className="min-w-0">{label}</span><FieldHint label={label} className="shrink-0" /></span>
      {children}
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: string[];
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span className="flex items-start justify-between gap-2"><span className="min-w-0">{label}</span><FieldHint label={label} className="shrink-0" /></span>
      <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue={defaultValue} name={name}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span className="flex items-start justify-between gap-2"><span className="min-w-0">{label}</span><FieldHint label={label} className="shrink-0" /></span>
      <textarea className="min-h-24 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue={defaultValue} name={name} />
    </label>
  );
}
