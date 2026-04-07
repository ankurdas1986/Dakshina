import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

type KpiCardProps = {
  label: string;
  value: number | string;
  detail: string;
  icon: LucideIcon;
  tone?: "amber" | "blue" | "green" | "rose" | "violet";
  className?: string;
};

const surfaceClassNames = {
  amber: "surface-kpi-amber",
  blue: "surface-kpi-blue",
  green: "surface-kpi-green",
  rose: "surface-kpi-rose",
  violet: "surface-kpi-violet"
} as const;

export function KpiCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "amber",
  className
}: KpiCardProps) {
  return (
    <div className={cn("rounded-[24px] border p-5 shadow-soft", surfaceClassNames[tone], className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">{label}</p>
          <p className="text-3xl font-extrabold tracking-tight text-white">{value}</p>
        </div>
        <div className="rounded-2xl bg-white/12 p-2.5 text-white shadow-inner shadow-white/5">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-white/80">{detail}</p>
    </div>
  );
}
