import type { ReactNode } from "react";
import { FieldHint } from "../ui/field-hint";

export function RitualField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span className="flex items-start justify-between gap-2"><span className="min-w-0">{label}</span><FieldHint label={label} className="shrink-0" /></span>
      {children}
    </label>
  );
}

export function RitualTextAreaField({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span className="flex items-start justify-between gap-2"><span className="min-w-0">{label}</span><FieldHint label={label} className="shrink-0" /></span>
      <textarea
        className="min-h-28 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        defaultValue={defaultValue}
        name={name}
      />
    </label>
  );
}

export function RitualSelectField({
  label,
  name,
  defaultValue,
  options
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span className="flex items-start justify-between gap-2"><span className="min-w-0">{label}</span><FieldHint label={label} className="shrink-0" /></span>
      <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue={defaultValue} name={name}>
        {options.map((option) => (
          <option key={option.value || "__empty"} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
