"use client";

import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookCheck,
  CalendarRange,
  CalendarSync,
  ChevronRight,
  CircleUserRound,
  Handshake,
  LayoutDashboard,
  Landmark,
  MapPinned,
  Menu,
  Search,
  Settings2,
  Wallet,
  X
} from "lucide-react";
import { signOut } from "../app/actions/auth";
import { moduleStatus } from "../lib/admin-data";
import { cn } from "../lib/utils";
import { AdminScrollMemory } from "./admin-scroll-memory";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DakshinaLogo } from "./dakshina-logo";
import type { AdminNotification } from "../lib/notification-store";

type AdminShellProps = {
  active: "dashboard" | "settings" | "priests" | "users" | "rituals" | "bookings" | "subscriptions" | "payouts" | "trust";
  children: ReactNode;
  userEmail?: string | null;
  title: string;
  subtitle: string;
  notificationCount?: number;
  notificationEnabled?: boolean;
  notifications?: AdminNotification[];
  breadcrumbs?: ReactNode;
  subnav?: ReactNode;
};

const iconMap = {
  dashboard: LayoutDashboard,
  settings: Settings2,
  priests: BookCheck,
  users: CircleUserRound,
  rituals: CalendarRange,
  bookings: MapPinned,
  subscriptions: CalendarSync,
  payouts: Landmark,
  trust: Handshake
} as const;

const searchConfig = {
  dashboard: {
    action: "/dashboard",
    placeholder: "Search alerts, queues, payouts, users..."
  },
  settings: {
    action: "/dashboard/settings",
    placeholder: "Search settings, policies, districts..."
  },
  priests: {
    action: "/dashboard/priests",
    placeholder: "Search priests, districts, rituals..."
  },
  users: {
    action: "/dashboard/users",
    placeholder: "Search users, phones, areas, traditions..."
  },
  rituals: {
    action: "/dashboard/rituals",
    placeholder: "Search tiers, categories, rituals..."
  },
  bookings: {
    action: "/dashboard/bookings",
    placeholder: "Search bookings, rituals, priests..."
  },
  subscriptions: {
    action: "/dashboard/subscriptions",
    placeholder: "Search temples, offices, factories..."
  },
  payouts: {
    action: "/dashboard/payouts",
    placeholder: "Search payouts, priests, bookings..."
  },
  trust: {
    action: "/dashboard/trust",
    placeholder: "Search trust controls, referrals, reviews..."
  }
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

function notificationTone(type: AdminNotification["type"]) {
  if (type === "refund" || type === "booking") {
    return {
      panel: "surface-panel-rose",
      icon: "bg-destructive/10 text-destructive"
    };
  }

  if (type === "kyc" || type === "subscription") {
    return {
      panel: "surface-panel-amber",
      icon: "bg-warning/20 text-warning-foreground"
    };
  }

  if (type === "priest_registration" || type === "user_registration" || type === "wallet") {
    return {
      panel: "surface-panel-blue",
      icon: "bg-sky-100 text-sky-700"
    };
  }

  return {
    panel: "surface-panel",
    icon: "bg-primary/10 text-primary"
  };
}

export function AdminShell({
  active,
  children,
  userEmail,
  title,
  subtitle,
  notificationCount = 0,
  notificationEnabled = true,
  notifications = [],
  breadcrumbs,
  subnav
}: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const initials = useMemo(() => getInitials(userEmail), [userEmail]);
  const currentSearch = searchConfig[active];
  const pathname = usePathname();

  const sidebarGroups = {
    settings: [
      { href: "/dashboard/settings" as Route, label: "Overview" },
      { href: "/dashboard/settings/culture" as Route, label: "Culture rollout" },
      { href: "/dashboard/settings/commercial" as Route, label: "Commercial rules" },
      { href: "/dashboard/settings/governance" as Route, label: "Governance" },
      { href: "/dashboard/settings/districts" as Route, label: "District overrides" },
      { href: "/dashboard/settings/notifications" as Route, label: "Notifications" }
    ],
    rituals: [
      { href: "/dashboard/rituals" as Route, label: "Overview" },
      { href: "/dashboard/rituals/categories" as Route, label: "Category tree" },
      { href: "/dashboard/rituals/library" as Route, label: "Ritual library" },
      { href: "/dashboard/rituals/panjika" as Route, label: "Panjika" },
      { href: "/dashboard/rituals/fard" as Route, label: "Fard" }
    ]
  } as const;

  const isDashboardActive = pathname === "/dashboard";
  const isSettingsExpanded = pathname.startsWith("/dashboard/settings");
  const isRitualsExpanded = pathname.startsWith("/dashboard/rituals");

  function isModuleActive(itemKey: AdminShellProps["active"]) {
    if (itemKey === "dashboard") {
      return isDashboardActive;
    }

    if (itemKey === "settings") {
      return isSettingsExpanded;
    }

    if (itemKey === "rituals") {
      return isRitualsExpanded;
    }

    return pathname === `/dashboard/${itemKey}` || pathname.startsWith(`/dashboard/${itemKey}/`);
  }

  useEffect(() => {
    let previousScroll = window.scrollY;

    const handleScroll = () => {
      const nextScroll = window.scrollY;
      const isNearTop = nextScroll < 24;
      const isScrollingUp = nextScroll < previousScroll;

      setHeaderVisible(isNearTop || isScrollingUp);
      previousScroll = nextScroll;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-transparent p-2 sm:p-3 lg:p-4">
      <AdminScrollMemory />
      <div className="relative">
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
            "fixed inset-y-2 left-2 z-40 w-[260px] max-w-[calc(100vw-1rem)] transition-transform sm:inset-y-3 sm:left-3 sm:max-w-[calc(100vw-1.5rem)] lg:inset-y-4 lg:left-4 lg:max-w-[calc(100vw-2rem)] xl:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-[110%]"
          )}
        >
          <Card className="h-[calc(100vh-1rem)] rounded-[24px] border-border/80 bg-white shadow-soft sm:h-[calc(100vh-1.5rem)] lg:h-[calc(100vh-2rem)]">
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
                    const isActive = isModuleActive(item.key);
                    const childItems = sidebarGroups[item.key as keyof typeof sidebarGroups];
                    const isExpanded = item.key === "settings" ? isSettingsExpanded : item.key === "rituals" ? isRitualsExpanded : false;

                    return (
                      <div className="space-y-1" key={item.key}>
                        <Link
                          className={cn(
                            "group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                            isActive
                              ? "border-primary/20 bg-primary/10 text-foreground"
                              : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary/45 hover:text-foreground"
                          )}
                          href={item.href as Route}
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
                          <ChevronRight className={cn("h-4 w-4 shrink-0 transition-transform", isExpanded ? "rotate-90" : "rotate-0")} />
                        </Link>
                        {childItems && isExpanded ? (
                          <div className="ml-4 space-y-1 border-l border-border/70 pl-3">
                            {childItems.map((child) => {
                              const isChildActive = pathname === child.href || pathname.startsWith(`${child.href}/`);

                              return (
                                <Link
                                  className={cn(
                                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                    isChildActive
                                      ? "bg-primary/10 text-foreground"
                                      : "text-muted-foreground hover:bg-secondary/45 hover:text-foreground"
                                  )}
                                  href={child.href}
                                  key={child.href}
                                  onClick={() => setSidebarOpen(false)}
                                >
                                  <span className={cn("h-2 w-2 rounded-full", isChildActive ? "bg-primary" : "bg-border")} />
                                  <span className="min-w-0 flex-1 truncate">{child.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </nav>
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="min-w-0 space-y-4 overflow-x-hidden pt-[76px] xl:ml-[280px]">
          <div className={cn(
            "fixed left-2 right-2 top-2 z-30 rounded-[24px] border border-border bg-white shadow-soft transition-transform duration-200 sm:left-3 sm:right-3 sm:top-3 lg:left-4 lg:right-4 lg:top-4 xl:left-[296px] xl:right-4",
            headerVisible ? "translate-y-0" : "-translate-y-[140%]"
          )}>
            <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground xl:hidden"
                  onClick={() => setSidebarOpen(true)}
                  type="button"
                >
                  <Menu className="h-4 w-4" />
                </button>

                <form action={currentSearch.action} className="relative w-full md:w-[320px] lg:w-[380px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="h-10 rounded-xl pl-9" name="q" placeholder={currentSearch.placeholder} />
                </form>
              </div>

              <div className="relative flex items-center gap-2 self-end md:self-auto">
                <button
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-xl border border-border",
                    notificationEnabled
                      ? "bg-white text-foreground hover:bg-secondary"
                      : "bg-secondary/40 text-muted-foreground"
                  )}
                  disabled={!notificationEnabled}
                  onClick={() => {
                    if (!notificationEnabled) {
                      return;
                    }

                    setNotificationMenuOpen((prev) => !prev);
                    setProfileMenuOpen(false);
                  }}
                  type="button"
                >
                  <Bell className="h-4 w-4 text-primary" />
                  {notificationEnabled && notificationCount > 0 ? (
                    <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                      {notificationCount}
                    </span>
                  ) : null}
                </button>
                {notificationEnabled && notificationMenuOpen ? (
                  <div className="absolute right-[4.25rem] top-[4.75rem] z-20 w-[320px] rounded-[20px] border border-border bg-white shadow-lg">
                    <div className="border-b border-border px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Notifications</p>
                      <p className="mt-1 text-sm text-foreground">
                        {notificationCount > 0 ? `${notificationCount} unread` : "All caught up"}
                      </p>
                    </div>
                    <div className="surface-scroll max-h-[360px] space-y-2 overflow-y-auto px-3 py-3">
                      {notifications.length ? notifications.map((item) => (
                        <Link
                          className={cn("block rounded-xl border border-border px-3 py-3 transition-colors hover:bg-secondary/40", notificationTone(item.type).panel)}
                          href={item.href as Route}
                          key={item.id}
                          onClick={() => setNotificationMenuOpen(false)}
                        >
                          <div className="flex items-start gap-3">
                            <span className={cn(
                              "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                              notificationTone(item.type).icon,
                              item.read ? "opacity-70" : "ring-2 ring-primary/10"
                            )}>
                              {item.type === "priest_registration" ? (
                                <BookCheck className="h-4 w-4" />
                              ) : item.type === "user_registration" ? (
                                <CircleUserRound className="h-4 w-4" />
                              ) : item.type === "booking" ? (
                                <MapPinned className="h-4 w-4" />
                              ) : item.type === "kyc" ? (
                                <Settings2 className="h-4 w-4" />
                              ) : item.type === "refund" ? (
                                <Wallet className="h-4 w-4" />
                              ) : item.type === "subscription" ? (
                                <CalendarSync className="h-4 w-4" />
                              ) : item.type === "wallet" ? (
                                <Landmark className="h-4 w-4" />
                              ) : (
                                <Handshake className="h-4 w-4" />
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                                {!item.read ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
                              </div>
                              <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.detail}</p>
                              <p className="mt-2 text-xs font-medium text-muted-foreground">{item.createdAt}</p>
                            </div>
                          </div>
                        </Link>
                      )) : (
                        <div className="rounded-xl border border-border bg-secondary/20 px-3 py-4 text-sm text-muted-foreground">
                          No notifications are available for the current alert settings.
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
                <div className="relative">
                  <button
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-sm text-foreground"
                    onClick={() => {
                      setProfileMenuOpen((prev) => !prev);
                      setNotificationMenuOpen(false);
                    }}
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
          </div>

          <div className="rounded-[24px] border border-border bg-white shadow-soft">
            <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Admin dashboard</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-[30px]">{title}</h2>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
              </div>

              <div className="inline-flex w-full max-w-full self-start items-center gap-2 rounded-xl border border-border bg-secondary/35 px-3 py-2 text-sm text-foreground sm:w-auto lg:self-auto">
                <span className="truncate">Active module: {title}</span>
              </div>
            </div>
          </div>

          {breadcrumbs}

          {subnav ? (
            <div className="rounded-[20px] border border-border bg-white px-4 py-3 shadow-soft">{subnav}</div>
          ) : null}

          {children}

          <footer className="rounded-[20px] border border-border bg-white/80 px-4 py-3 text-sm text-muted-foreground shadow-soft backdrop-blur">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-medium text-foreground">Dakshina Hub Admin</p>
              <div className="text-right">
                <p>Designed and developed by Ankur Das</p>
                <p>Copyright 2026 Dakshina Hub. Admin operations console.</p>
              </div>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}
