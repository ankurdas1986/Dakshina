import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bell,
  BellDot,
  BookCheck,
  CalendarRange,
  ChevronRight,
  LayoutDashboard,
  MapPinned,
  Menu,
  Search,
  ShieldCheck
} from "lucide-react";
import { signOut } from "../app/actions/auth";
import { moduleStatus } from "../lib/admin-data";
import { cn } from "../lib/utils";
import { DakshinaLogo } from "./dakshina-logo";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";

type AdminShellProps = {
  active: "settings" | "priests" | "rituals" | "bookings" | "trust";
  children: ReactNode;
  userEmail?: string | null;
  title: string;
  subtitle: string;
  notificationCount?: number;
  notificationEnabled?: boolean;
  subnav?: ReactNode;
};

const iconMap = {
  settings: ShieldCheck,
  priests: BookCheck,
  rituals: CalendarRange,
  bookings: MapPinned,
  trust: BellDot
} as const;

export function AdminShell({
  active,
  children,
  userEmail,
  title,
  subtitle,
  notificationCount = 0,
  notificationEnabled = true,
  subnav
}: AdminShellProps) {
  return (
    <main className="min-h-screen bg-transparent px-3 py-3 md:px-5 md:py-5">
      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="rounded-[28px] border-border/80 bg-white xl:sticky xl:top-5 xl:max-h-[calc(100vh-2.5rem)] xl:overflow-hidden">
          <CardContent className="surface-scroll space-y-6 p-4 md:p-5 xl:max-h-[calc(100vh-2.5rem)] xl:overflow-y-auto xl:pr-3">
            <DakshinaLogo compact />

            <div className="rounded-3xl border border-border bg-secondary/40 p-4 text-sm leading-6 text-muted-foreground">
              Admin-first rollout. Each module reads from platform policy, district rules, and booking controls.
            </div>

            <div className="space-y-2.5">
              <p className="px-1 text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                Navigation
              </p>
              <nav className="grid gap-2">
                {moduleStatus.map((item) => {
                  const Icon = iconMap[item.key];
                  const isActive = item.key === active;

                  return (
                    <Link
                      className={cn(
                        "group flex items-center justify-between rounded-2xl border px-3.5 py-3 text-sm transition-colors",
                        isActive
                          ? "border-primary/25 bg-primary/10 text-foreground"
                          : "border-transparent bg-white text-muted-foreground hover:border-border hover:bg-secondary/50 hover:text-foreground"
                      )}
                      href={item.href}
                      key={item.key}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className={cn("rounded-xl p-2", isActive ? "bg-white text-primary" : "bg-secondary/70 text-muted-foreground group-hover:text-primary")}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="truncate font-semibold">{item.title}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    </Link>
                  );
                })}
              </nav>
            </div>

            <Separator />

            <div className="rounded-3xl border border-border bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                  Active operator
                </p>
                <Badge variant="outline">Admin</Badge>
              </div>
              <p className="mt-3 truncate text-base font-semibold text-foreground">{userEmail ?? "admin@dakshina.local"}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Manual KYC, commission rules, privacy timing, and referral policy remain under admin control.
              </p>
            </div>

            <form action={signOut}>
              <Button className="w-full" variant="secondary" type="submit">
                Sign out
              </Button>
            </form>
          </CardContent>
        </Card>

        <section className="min-w-0 space-y-5">
          <header className="flex flex-col gap-4 rounded-[28px] border border-border bg-white px-5 py-4 shadow-soft md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                <Menu className="h-3.5 w-3.5" />
                <span>Admin dashboard</span>
              </div>
              <h2 className="truncate text-xl font-extrabold tracking-tight text-foreground md:text-2xl">{title}</h2>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
            </div>

            <div className="flex flex-col gap-3 lg:min-w-[360px] lg:max-w-[460px] lg:flex-row lg:items-center lg:justify-end">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-secondary/40 px-3 py-2 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                <span>Search modules</span>
              </div>
              <Link
                aria-disabled={!notificationEnabled}
                className={cn(
                  "flex items-center justify-center rounded-2xl border border-border px-3 py-2 text-sm",
                  notificationEnabled
                    ? "bg-white text-foreground hover:bg-secondary"
                    : "bg-secondary/40 text-muted-foreground"
                )}
                href="/dashboard"
              >
                <span className="relative inline-flex items-center">
                  <Bell className="h-4 w-4 text-primary" />
                  {notificationEnabled && notificationCount > 0 ? (
                    <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {notificationCount}
                    </span>
                  ) : null}
                </span>
              </Link>
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-white px-3 py-2 text-sm text-foreground">
                <LayoutDashboard className="h-4 w-4 text-primary" />
                <span>{title}</span>
              </div>
            </div>
          </header>

          {subnav ? (
            <div className="rounded-[24px] border border-border bg-white px-4 py-3 shadow-soft">
              {subnav}
            </div>
          ) : null}

          {children}
        </section>
      </div>
    </main>
  );
}
