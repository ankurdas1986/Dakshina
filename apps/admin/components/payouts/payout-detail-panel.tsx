import type { ReactNode } from "react";
import { MessageCircleMore } from "lucide-react";
import { confirmManualPayout, savePayoutEntry } from "../../app/actions/payouts";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { PayoutEntry } from "../../lib/payout-store";
import { buildWhatsAppLink } from "../../lib/utils";

export function getPayoutVariant(status: string) {
  if (status === "paid") {
    return "success" as const;
  }

  if (status === "failed") {
    return "secondary" as const;
  }

  return "outline" as const;
}

type PayoutDetailPanelProps = {
  entry: PayoutEntry;
  returnTo: string;
};

export function PayoutDetailPanel({ entry, returnTo }: PayoutDetailPanelProps) {
  const waLink = buildWhatsAppLink(
    "+919000000000",
    `Dakshina Hub admin update: manual payout for ${entry.bookingCode} (${entry.ritual}) is being processed for ${entry.priest}.`
  );

  return (
    <form action={savePayoutEntry} className="space-y-5">
      <input name="id" type="hidden" value={entry.id} />
      <input name="returnTo" type="hidden" value={returnTo} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xl font-semibold text-foreground">
            {entry.bookingCode} - {entry.ritual}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {entry.priest} | {entry.completedAt}
          </p>
        </div>
        <Badge variant={getPayoutVariant(entry.status)}>{entry.status}</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild type="button" variant="secondary">
          <a href={waLink} rel="noreferrer" target="_blank">
            <MessageCircleMore className="h-4 w-4 text-primary" />
            WhatsApp payout note
          </a>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Account holder">
          <Input defaultValue={entry.payoutDetails.accountHolder} name="accountHolder" required />
        </Field>
        <Field label="UPI ID">
          <Input defaultValue={entry.payoutDetails.upiId} name="upiId" required />
        </Field>
        <Field label="Payout amount (Rs)">
          <Input defaultValue={entry.payoutAmount} min={0} name="payoutAmount" required type="number" />
        </Field>
        <SelectField
          defaultValue={entry.status}
          label="Payout state"
          name="status"
          options={[
            { value: "pending", label: "pending" },
            { value: "scheduled", label: "scheduled" },
            { value: "paid", label: "paid" },
            { value: "failed", label: "failed" }
          ]}
        />
        <Field label="Scheduled for">
          <Input defaultValue={entry.payoutScheduledFor} name="payoutScheduledFor" />
        </Field>
        <Field label="Reference">
          <Input defaultValue={entry.payoutReference} name="payoutReference" placeholder="UPI / bank reference" />
        </Field>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-foreground">
        <span>Admin notes</span>
        <textarea
          className="min-h-28 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          defaultValue={entry.payoutNotes}
          name="payoutNotes"
        />
      </label>

      <div className="rounded-[20px] border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Confirm manual payout</p>
        <p className="mt-2 leading-6">After you complete the UPI transfer, click confirm to mark this payout as settled and append a ledger entry for priest settlement.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
            formAction={confirmManualPayout}
            type="submit"
          >
            Confirm manual payout
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Save payout</Button>
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

