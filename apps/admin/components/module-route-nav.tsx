import type { Route } from "next";
import Link from "next/link";
import { cn } from "../lib/utils";

type ModuleRouteNavItem = {
  href: Route;
  label: string;
  primary?: boolean;
};

type ModuleRouteNavProps = {
  items: ModuleRouteNavItem[];
  activeHref: string;
};

export function ModuleRouteNav({ items, activeHref }: ModuleRouteNavProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = activeHref === item.href;

        return (
          <Link
            className={cn(
              "inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              isActive || item.primary
                ? "border-primary/20 bg-primary/10 text-foreground"
                : "border-border bg-white text-foreground hover:bg-secondary/40"
            )}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
