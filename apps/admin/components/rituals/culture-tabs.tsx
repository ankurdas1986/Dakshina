"use client";

import type { Route } from "next";
import Link from "next/link";
import { cn } from "../../lib/utils";

const cultures = [
  { value: "Bengali", label: "Bengali", icon: "🪷" },
  { value: "North_Indian", label: "North Indian", icon: "🪔" },
  { value: "Marwadi", label: "Marwadi", icon: "🏵️" },
  { value: "Odia", label: "Odia", icon: "🌺" },
  { value: "Gujarati", label: "Gujarati", icon: "🪘" }
] as const;

type CultureTabsProps = {
  activeCulture: string;
  basePath: string;
  counts?: Record<string, number>;
};

export function CultureTabs({ activeCulture, basePath, counts }: CultureTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {cultures.map((culture) => {
        const isActive = activeCulture === culture.value;
        const count = counts?.[culture.value];
        return (
          <Link
            key={culture.value}
            href={`${basePath}?culture=${culture.value}` as Route}
            className={cn(
              "group relative inline-flex items-center gap-2.5 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-200",
              isActive
                ? "border-primary/30 bg-gradient-to-b from-primary/15 to-primary/5 text-foreground shadow-sm ring-1 ring-primary/10"
                : "border-border bg-white text-muted-foreground hover:border-primary/20 hover:bg-primary/5 hover:text-foreground"
            )}
          >
            <span className="text-base leading-none">{culture.icon}</span>
            <span>{culture.label}</span>
            {count !== undefined ? (
              <span
                className={cn(
                  "ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}
              >
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
