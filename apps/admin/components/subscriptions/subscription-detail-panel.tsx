import type { ReactNode } from "react";
import { CalendarClock, MessageCircleMore } from "lucide-react";
import { saveSubscriptionRecord } from "../../app/actions/subscriptions";
import type { SubscriptionRecord } from "../../lib/subscription-store";
import { buildWhatsAppLink } from "../../lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function getSubscriptionVariant(status: SubscriptionRecord["status"]) {
  if (status === "active") {
    return "success" as const;
  }

  if (status === "paused" || status === "cancelled") {
    return "secondary" as const;
  }

  return "outline" as const;
}

export function SubscriptionDetailPanel({ entry, returnTo }: { entry: SubscriptionRecord; returnTo: string }) {
  const waLink = buildWhatsAppLink(
    "+919000000000",
    `Dakshina Hub admin update: contract ${entry.entityName} is being reviewed for ${entry.frequency} ${entry.ritual} coverage.`
  );

  return (
    <form action={saveSubscriptionRecord} className="space-y-5">
      <input name="id" type="hidden" value={entry.id} />
      <input name="returnTo" type="hidden" value={returnTo} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xl font-semibold text-foreground">{entry.entityName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {entry.entityType} | {entry.locality}, {entry.district} | {entry.cultureType.replace("_", " ")}
          </p>
        </div>
        <Badge variant={getSubscriptionVariant(entry.status)}>{entry.status}</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild type="button" variant="secondary">
          <a href={waLink} rel="noreferrer" target="_blank">
            <MessageCircleMore className="h-4 w-4 text-primary" />
            WhatsApp contract note
          </a>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Entity name"><Input defaultValue={entry.entityName} name="entityName" required /></Field>
        <SelectField label="Entity type" name="entityType" defaultValue={entry.entityType} options={["temple", "office", "factory"]} />
        <Field label="District"><Input defaultValue={entry.district} name="district" required /></Field>
        <Field label="Locality"><Input defaultValue={entry.locality} name="locality" required /></Field>
        <Field label="Ritual"><Input defaultValue={entry.ritual} name="ritual" required /></Field>
        <SelectField label="Culture" name="cultureType" defaultValue={entry.cultureType} options={["Bengali", "North_Indian", "Marwadi", "Odia", "Gujarati"]} />
        <SelectField label="Frequency" name="frequency" defaultValue={entry.frequency} options={["daily", "weekly", "monthly"]} />
        <SelectField label="Duration" name="durationMonths" defaultValue={String(entry.durationMonths)} options={["3", "6", "12"]} />
        <Field label="Starts on"><Input defaultValue={entry.startsOn} name="startsOn" /></Field>
        <Field label="Ends on"><Input defaultValue={entry.endsOn} name="endsOn" /></Field>
        <Field label="Next generation date"><Input defaultValue={entry.nextGenerationDate} name="nextGenerationDate" /></Field>
        <SelectField label="Status" name="status" defaultValue={entry.status} options={["draft", "active", "paused", "completed", "cancelled"]} />
      </div>

      <div className="rounded-[24px] border border-border bg-secondary/20 p-4">
        <div className="mb-3 flex items-center gap-2 text-foreground">
          <CalendarClock className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Generated booking pre-blocks</p>
        </div>
        <div className="space-y-2">
          {entry.generatedBookingCodes.length ? entry.generatedBookingCodes.map((code) => (
            <div className="rounded-[18px] border border-border bg-white px-3 py-3 text-sm text-foreground" key={code}>
              {code}
            </div>
          )) : (
            <div className="rounded-[18px] border border-border bg-white px-3 py-4 text-sm text-muted-foreground">
              No generated bookings yet. This contract is ready to pre-block calendars when activated.
            </div>
          )}
        </div>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-foreground">
        <span>Generated booking codes</span>
        <textarea className="min-h-24 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue={entry.generatedBookingCodes.join(", ")} name="generatedBookingCodes" />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-foreground">
        <span>Contract notes</span>
        <textarea className="min-h-24 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue={entry.notes} name="notes" />
      </label>

      <div className="flex justify-end">
        <Button type="submit">Save subscription</Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span>{label}</span>
      <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue={defaultValue} name={name}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
