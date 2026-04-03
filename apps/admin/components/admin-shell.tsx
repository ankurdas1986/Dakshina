"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Bell,
  BookCheck,
  CalendarRange,
  ChevronRight,
  LayoutDashboard,
  MapPinned,
  Menu,
  Search,
  ShieldCheck,
  UserCircle2,
  X
} from "lucide-react";
import { signOut } from "../app/actions/auth";
import { moduleStatus } from "../lib/admin-data";
import { cn } from "../lib/utils";
import { DakshinaLogo } from "./dakshina-logo";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
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
  trust: Bell
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initials = useMemo(() => getInitials(userEmail), [userEmail]);

  return (
    <main className="min-h-screen bg-transparent p-3 md:p-4">
      <div className="xl:grid xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-4">
        <button
          aria-hidden={!sidebarOpen}
          className={cn(
            "fixed inset-0 z-30 bg-foreground/30 transition-opacity xl:hidden",
            sidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          )}
          onClick={() => setSidebarOpen(false)}
          type="button"
        />

        <aside
          className={cn(
            "fixed inset-y-3 left-3 z-40 w-[260px] max-w-[calc(100vw-1.5rem)] transition-transform xl:static xl:inset-auto xl:w-auto xl:max-w-none xl:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-[110%]"
          )}
        >
          <Card className="h-[calc(100vh-1.5rem)] rounded-[24px] border-border/80 bg-white shadow-soft xl:h-[calc(100vh-2rem)]">
            <CardContent className="flex h-full flex-col gap-5 overflow-hidden p-4">
              <div className="flex items-center justify-between xl:hidden">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Navigation</p>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground"
                  onClick={() => setSidebarOpen(false)}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <DakshinaLogo compact />

              <div className="rounded-2xl border border-border bg-secondary/35 px-3 py-3 text-xs leading-5 text-muted-foreground">
                Every module reads from platform policy, district rules, and booking controls.
              </div>

              <div className="flex min-h-0 flex-1 flex-col space-y-2">
                <p className="px-1 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                  Navigation
                </p>
                <nav className="surface-scroll grid gap-1.5 overflow-y-auto pr-1">
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
                        onClick={() => setSidebarOpen(false)}
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
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{userEmail ?? "admin@dakshina.local"}</p>
                      <p className="text-xs text-muted-foreground">Super admin operator</p>
                    </div>
                  </div>
                </div>
                <form action={signOut}>
                  <Button className="h-10 w-full rounded-xl" type="submit" variant="secondary">
                    Sign out
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="min-w-0 space-y-4 xl:pl-4">
          <div className="rounded-[24px] border border-border bg-white shadow-soft">
            <div className="flex flex-col gap-3 border-b border-border px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground xl:hidden"
                  onClick={() => setSidebarOpen(true)}
                  type="button"
                >
                  <Menu className="h-4 w-4" />
                </button>

                <div className="relative w-full md:w-[320px] lg:w-[380px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="h-10 rounded-xl pl-9" placeholder="Search modules, rituals, priests..." />
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
                  href="/dashboard#notifications"
                >
                  <Bell className="h-4 w-4 text-primary" />
                  {notificationEnabled && notificationCount > 0 ? (
                    <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                      {notificationCount}
                    </span>
                  ) : null}
                </Link>
                <div className="hidden items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground sm:flex">
                  <UserCircle2 className="h-4 w-4 text-primary" />
                  <span className="max-w-[180px] truncate">{userEmail ?? "admin@dakshina.local"}</span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-sm font-bold text-foreground sm:hidden">
                  {initials}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Admin dashboard</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-[30px]">{title}</h2>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
              </div>

              <div className="inline-flex max-w-full items-center gap-2 rounded-xl border border-border bg-secondary/35 px-3 py-2 text-sm text-foreground">
                <span className="truncate">Active module: {title}</span>
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
