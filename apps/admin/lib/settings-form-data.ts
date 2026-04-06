import type { CultureType } from "./settings";

export const settingsCheckboxClassName =
  "mt-1 h-4 w-4 rounded border-border accent-[hsl(var(--primary))] focus:ring-primary";

export const settingsCultureOptions: Array<{ value: CultureType; label: string }> = [
  { value: "Bengali", label: "Bengali" },
  { value: "North_Indian", label: "North Indian (UP/Bihar)" },
  { value: "Marwadi", label: "Marwadi" },
  { value: "Odia", label: "Odia" },
  { value: "Gujarati", label: "Gujarati" }
];
