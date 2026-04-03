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
  ShieldCheck,
  Sparkles,
  UserCircle2
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

function getInitials(email?: string | null) {
  if (!email) {
    return "AD";
  }

  const source = email.split("@")[0] ?? email;
  const cleaned = source.replace(/[^a-zA-Z0-9]/g, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

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
    <main className="min-h-screen bg-transparent p-3 md:p-4">
      <div className="grid gap-4 xl:grid-cols-[286px_minmax(0,1fr)]">
        <Card className="rounded-[24px] border-border/80 bg-white xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)] xl:overflow-hidden">
          <CardContent className="surface-scroll flex h-full flex-col gap-5 overflow-y-auto p-4">
            <DakshinaLogo compact />

            <div className="rounded-2xl border border-border bg-secondary/35 px-3 py-3 text-xs leading-5 text-muted-foreground">
              Every module reads from platform policy, district rules, and booking controls.
            </div>

            <div className="space-y-2">
              <p className="px-1 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                Navigation
              </p>
              <nav className="grid gap-1.5">
                {moduleStatus.map((item) => {
                  const Icon = iconMap[item.key];
                  const isActive = item.key === active;

                  return (
                    <Link
                      className={cn(
                        "group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                        isActive
                          ? "border-primary/20 bg-primary/10 text-foreground"
                          : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary/45 hover:text-foreground"
                      )}
                      href={item.href}
                      key={item.key}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          isActive
                            ? "bg-white text-primary"
                            : "bg-secondary/60 text-muted-foreground group-hover:text-primary"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium">{item.title}</span>
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="mt-auto space-y-4">
              <Separator />
              <div className="rounded-2xl border border-border bg-white p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground">
                    {getInitials(userEmail)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{userEmail ?? "admin@dakshina.local"}</p>
                    <p className="text-xs text-muted-foreground">Super admin operator</p>
                  </div>
                </div>
              </div>
              <form action={signOut}>
                <Button className="h-10 w-full rounded-xl" variant="secondary" type="submit">
                  Sign out
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        <section className="min-w-0 space-y-4">
          <div className="rounded-[24px] border border-border bg-white shadow-soft">
            <div className="flex flex-col gap-3 border-b border-border px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground" type="button">
                  <Menu className="h-4 w-4" />
                </button>
                <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground md:min-w-[320px]">
                  <Search className="h-4 w-4" />
                  <span className="truncate">Search modules...</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <Link
                  aria-disabled={!notificationEnabled}
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-xl border border-border",
                    notificationEnabled
                      ? "bg-white text-foreground hover:bg-secondary"
                      : "bg-secondary/40 text-muted-foreground"
                  )}
                  href="/dashboard"
                >
                  <Bell className="h-4 w-4 text-primary" />
                  {notificationEnabled && notificationCount > 0 ? (
                    <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                      {notificationCount}
                    </span>
                  ) : null}
                </Link>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-sm font-bold text-foreground">
                  {getInitials(userEmail)}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Admin dashboard</span>
                </div>
                <h2 className="truncate text-[28px] font-bold tracking-tight text-foreground">{title}</h2>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground">
                <UserCircle2 className="h-4 w-4 text-primary" />
                <span className="truncate">{title}</span>
              </div>
            </div>
          </div>

          {subnav ? (
            <div className="rounded-[20px] border border-border bg-white px-4 py-3 shadow-soft">{subnav}</div>
          ) : null}

          {children}
        </section>
      </div>
    </main>
  );
}
