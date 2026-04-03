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
  Settings2,
  X
} from "lucide-react";
import { signOut } from "../app/actions/auth";
import { moduleStatus } from "../lib/admin-data";
import { cn } from "../lib/utils";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DakshinaLogo } from "./dakshina-logo";

type AdminShellProps = {
  active: "settings" | "priests" | "rituals" | "bookings" | "trust";
  children: ReactNode;
  userEmail?: string | null;
  title: string;
  subtitle: string;
  notificationCount?: number;
  notificationEnabled?: boolean;
  breadcrumbs?: ReactNode;
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
  breadcrumbs,
  subnav
}: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
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
            "fixed inset-y-3 left-3 z-40 w-[260px] max-w-[calc(100vw-1.5rem)] transition-transform xl:sticky xl:top-3 xl:self-start xl:w-auto xl:max-w-none xl:translate-x-0",
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

              <div className="flex min-h-0 flex-1 flex-col space-y-2">
                <p className="px-1 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                  Navigation
                </p>
                <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
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
                <div className="relative">
                  <button
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-sm text-foreground"
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                    type="button"
                  >
                    <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground">
                      {initials}
                      <span className="absolute right-0 top-0 inline-flex h-2 w-2 rounded-full bg-success" />
                    </span>
                  </button>
                  {profileMenuOpen ? (
                    <div className="absolute right-0 top-full z-20 mt-2 w-[240px] rounded-[20px] border border-border bg-white shadow-lg">
                      <div className="rounded-t-[18px] bg-gradient-to-br from-primary/20 to-secondary/40 px-4 py-3 text-sm text-foreground">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Operator</p>
                        <p className="text-base font-semibold">Dakshina Admin</p>
                        <p className="text-xs text-muted-foreground">{userEmail ?? "admin@dakshina.local"}</p>
                      </div>
                      <div className="space-y-2 px-4 py-3 text-sm text-foreground">
                        <Link
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-secondary/50"
                          href="/dashboard"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4 text-primary" />
                          Dashboard
                        </Link>
                        <Link
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-secondary/50"
                          href="/dashboard#notifications"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <Bell className="h-4 w-4 text-primary" />
                          Notifications
                        </Link>
                        <Link
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-secondary/50"
                          href="/dashboard"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <Settings2 className="h-4 w-4 text-primary" />
                          Global settings
                        </Link>
                        <div className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
                          Signed in as
                          <p className="mt-1 text-sm font-semibold text-foreground">{userEmail ?? "admin@dakshina.local"}</p>
                        </div>
                        <form action={signOut}>
                          <Button className="w-full justify-start rounded-xl" type="submit" variant="secondary">
                            <ChevronRight className="h-4 w-4 text-primary" />
                            Log out
                          </Button>
                        </form>
                      </div>
                    </div>
                  ) : null}
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

          {breadcrumbs ? (
            <div className="rounded-[20px] border border-border bg-white px-4 py-3 shadow-soft">{breadcrumbs}</div>
          ) : null}

          {subnav ? (
            <div className="rounded-[20px] border border-border bg-white px-4 py-3 shadow-soft">{subnav}</div>
          ) : null}

          {children}

          <footer className="rounded-[20px] border border-border bg-white/80 px-4 py-3 text-sm text-muted-foreground shadow-soft backdrop-blur">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-medium text-foreground">Dakshina Direct Admin</p>
              <p>Copyright 2026 Dakshina Direct. Admin operations console.</p>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}
