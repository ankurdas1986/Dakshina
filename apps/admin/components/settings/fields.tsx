import { FieldHint } from "../ui/field-hint";
import { Input } from "../ui/input";

type FieldProps = {
  label: string;
  name: string;
  defaultValue: string;
};

export function SettingsField({ label, name, defaultValue }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span className="flex items-start justify-between gap-2"><span className="min-w-0">{label}</span><FieldHint label={label} className="shrink-0" /></span>
      <Input defaultValue={defaultValue} name={name} required />
    </label>
  );
}

type NumberFieldProps = {
  label: string;
  name: string;
  defaultValue: number;
};

export function SettingsNumberField({ label, name, defaultValue }: NumberFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span className="flex items-start justify-between gap-2"><span className="min-w-0">{label}</span><FieldHint label={label} className="shrink-0" /></span>
      <Input defaultValue={defaultValue} min={0} name={name} required type="number" />
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
};

export function SettingsSelectField({ label, name, defaultValue, options }: SelectFieldProps) {
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

type TextAreaFieldProps = {
  label: string;
  name: string;
  defaultValue: string;
};

export function SettingsTextAreaField({ label, name, defaultValue }: TextAreaFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span className="flex items-start justify-between gap-2"><span className="min-w-0">{label}</span><FieldHint label={label} className="shrink-0" /></span>
      <textarea className="min-h-24 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue={defaultValue} name={name} />
    </label>
  );
}
