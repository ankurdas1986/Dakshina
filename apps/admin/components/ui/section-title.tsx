import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

type SectionTitleProps = {
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
  tone?: "default" | "amber" | "blue" | "green" | "rose" | "violet";
};

const toneClassNames = {
  default: "bg-primary/10 text-primary",
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-sky-100 text-sky-700",
  green: "bg-emerald-100 text-emerald-700",
  rose: "bg-rose-100 text-rose-700",
  violet: "bg-violet-100 text-violet-700"
} as const;

export function SectionTitle({ icon: Icon, children, className, tone = "default" }: SectionTitleProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-2xl", toneClassNames[tone])}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-lg font-semibold tracking-tight text-foreground">{children}</span>
    </div>
  );
}
