import type { Route } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BellRing,
  BookCheck,
  LayoutGrid,
  Landmark,
  MessageCircleMore,
  RadioTower,
  ShieldAlert,
  Siren,
  Wallet
} from "lucide-react";
import { AdminShell } from "../../components/admin-shell";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "../../components/ui/card";
import { KpiCard } from "../../components/ui/kpi-card";
import { SectionTitle } from "../../components/ui/section-title";
import { getAdminShellData } from "../../lib/admin-shell-data";
import { requireAdminUser } from "../../lib/auth";
import { getBookingMetrics, getBookingStore } from "../../lib/booking-store";
import { moduleStatus } from "../../lib/admin-data";
import { getNotificationStore } from "../../lib/notification-store";
import { getPayoutMetrics, getPayoutStore } from "../../lib/payout-store";
import { getPriestMetrics, getPriestStore } from "../../lib/priest-store";
import { getSubscriptionMetrics, getSubscriptionStore } from "../../lib/subscription-store";
import { getUserMetrics, getUserStore } from "../../lib/user-store";
import { cn } from "../../lib/utils";

export const dynamic = "force-dynamic";

function sanitizeWhatsappNumber(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits.length >= 10 ? digits : "";
}

function buildWhatsappLink(number: string, title: string, detail: string, href: string) {
  const sanitized = sanitizeWhatsappNumber(number);

  if (!sanitized) {
    return null;
  }

  const text = encodeURIComponent(
    `Dakshina Hub admin alert\n\n${title}\n${detail}\n\nOpen: ${href}`
  );

  return `https://wa.me/${sanitized}?text=${text}`;
}

function notificationTone(type: string) {
  if (type === "refund" || type === "booking") {
    return {
      badge: "danger" as const,
      panel: "surface-panel-rose alert-ring-high"
    };
  }

  if (type === "kyc" || type === "subscription") {
    return {
      badge: "warning" as const,
      panel: "surface-panel-amber alert-ring-medium"
    };
  }

  if (type === "priest_registration" || type === "user_registration" || type === "wallet") {
    return {
      badge: "info" as const,
      panel: "surface-panel-blue alert-ring-low"
    };
  }

  return {
    badge: "outline" as const,
    panel: "surface-panel"
  };
}

function moduleTone(key: string) {
  switch (key) {
    case "settings":
      return "surface-panel-amber";
    case "priests":
      return "surface-panel-blue";
    case "users":
      return "surface-panel-violet";
    case "rituals":
      return "surface-panel-amber";
    case "bookings":
      return "surface-panel-rose";
    case "subscriptions":
      return "surface-panel-blue";
    case "payouts":
      return "surface-panel-green";
    case "trust":
      return "surface-panel-violet";
    default:
      return "surface-panel";
  }
}

export default async function DashboardLandingPage() {
  const user = await requireAdminUser();
  const { notifications, notificationCount, notificationEnabled, settings } = await getAdminShellData();
  const priestStore = await getPriestStore();
  const userStore = await getUserStore();
  const bookingStore = await getBookingStore();
  const payoutStore = await getPayoutStore();
  const subscriptionStore = await getSubscriptionStore();
  const rawNotificationStore = await getNotificationStore();

  const priestMetrics = getPriestMetrics(priestStore);
  const userMetrics = getUserMetrics(userStore);
  const bookingMetrics = getBookingMetrics(bookingStore);
  const payoutMetrics = getPayoutMetrics(payoutStore);
  const subscriptionMetrics = getSubscriptionMetrics(subscriptionStore);
  const whatsappNumber = settings.notificationSettings.superAdminWhatsappNumber;
  const topNotifications = notifications.slice(0, 6);

  const priorityCards = [
    {
      label: "Unread alerts",
      value: notificationCount,
      detail: "Fresh admin notifications waiting in the in-app inbox.",
      icon: BellRing,
      tone: "rose" as const
    },
    {
      label: "Pending KYC",
      value: priestMetrics.pendingKyc,
      detail: "Priest registrations waiting for verification decisions.",
      icon: BookCheck,
      tone: "amber" as const
    },
    {
      label: "Refund cases",
      value: bookingMetrics.refundCases,
      detail: "Bookings that currently carry pending refund exposure.",
      icon: Wallet,
      tone: "rose" as const
    },
    {
      label: "Pending payouts",
      value: payoutMetrics.pendingCount,
      detail: "Manual priest settlements waiting for operator action.",
      icon: Landmark,
      tone: "green" as const
    }
  ];

  const urgentQueues = [
    {
      title: "Priest registrations",
      value: priestMetrics.totalPriests,
      summary: `${priestMetrics.pendingKyc} pending KYC, ${priestMetrics.verifiedPriests} verified, ${priestMetrics.culturesCovered} cultures covered.`,
      href: "/dashboard/priests" as Route
    },
    {
      title: "User governance",
      value: userMetrics.totalUsers,
      summary: `${userMetrics.activeUsers} active, ${userMetrics.blockedUsers} blocked, ${userMetrics.walletUsers} wallet users.`,
      href: "/dashboard/users" as Route
    },
    {
      title: "Booking watchlist",
      value: bookingMetrics.activeBookings,
      summary: `${bookingMetrics.paymentPending} payments pending, ${bookingMetrics.replacementCases} replacements, ${bookingMetrics.completionPending} completion cases.`,
      href: "/dashboard/bookings" as Route
    },
    {
      title: "Institutional contracts",
      value: subscriptionMetrics.totalContracts,
      summary: `${subscriptionMetrics.activeContracts} active, ${subscriptionMetrics.generatedBookings} generated bookings across recurring contracts.`,
      href: "/dashboard/subscriptions" as Route
    }
  ];

  return (
    <AdminShell
      active="dashboard"
      notificationCount={notificationCount}
      notificationEnabled={notificationEnabled}
      notifications={notifications}
      subtitle="This is the super-admin command center. Review alerts, registrations, booking issues, payouts, and escalations before entering module workspaces."
      title="Operations dashboard"
      userEmail={user.email}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {priorityCards.map((card) => (
          <KpiCard
            detail={card.detail}
            icon={card.icon}
            key={card.label}
            label={card.label}
            tone={card.tone}
            value={card.value}
          />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="surface-panel-blue rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <SectionTitle icon={LayoutGrid} tone="blue">Priority queues</SectionTitle>
            <CardDescription>Use the dashboard first, then move into the relevant module. This keeps the landing route operational instead of configuration-heavy.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {urgentQueues.map((queue) => (
              <Link className="group rounded-[22px] border border-border bg-white p-4 transition-colors hover:bg-secondary/30" href={queue.href} key={queue.href}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{queue.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{queue.value}</Badge>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{queue.summary}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="surface-panel-amber rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <SectionTitle icon={BellRing} tone="amber">Admin alert inbox</SectionTitle>
                <CardDescription>All new notifications are surfaced here on landing before they roll into module-specific handling.</CardDescription>
              </div>
              <Badge variant={notificationCount > 0 ? "success" : "outline"}>{notificationCount} unread</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {topNotifications.map((notification) => {
              const whatsappLink = settings.notificationSettings.whatsappAlertsEnabled
                ? buildWhatsappLink(whatsappNumber, notification.title, notification.detail, notification.href)
                : null;

              return (
                <div className={cn("rounded-[22px] border border-border p-4", notificationTone(notification.type).panel)} key={notification.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                    <Badge variant={notification.read ? "outline" : notificationTone(notification.type).badge}>{notification.read ? "Seen" : "New"}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{notification.detail}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={notification.href as Route}>Open alert</Link>
                    </Button>
                    {whatsappLink ? (
                      <Button asChild size="sm">
                        <a href={whatsappLink} rel="noreferrer" target="_blank">
                          <MessageCircleMore className="h-4 w-4" />
                          WhatsApp
                        </a>
                      </Button>
                    ) : null}
                    <span className="text-xs text-muted-foreground">{notification.createdAt}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="surface-panel-violet rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <SectionTitle icon={MessageCircleMore} tone="violet">WhatsApp escalation</SectionTitle>
            <CardDescription>Zero-cost mode uses `wa.me` deep links. This does not auto-send messages, but it gives you one-click WhatsApp escalation from the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-[22px] border border-border bg-secondary/20 p-4">
              <p className="text-sm font-semibold text-foreground">Configured number</p>
              <p className="mt-1 text-sm text-muted-foreground">{whatsappNumber}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                WhatsApp alert links are {settings.notificationSettings.whatsappAlertsEnabled ? "enabled" : "disabled"} in notification settings.
              </p>
            </div>
            {topNotifications.slice(0, 3).map((notification) => {
              const whatsappLink = buildWhatsappLink(whatsappNumber, notification.title, notification.detail, notification.href);
              return (
                <div className={cn("rounded-[22px] border border-border p-4", notificationTone(notification.type).panel)} key={`wa-${notification.id}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                    <Badge variant={notificationTone(notification.type).badge}>{notification.type.replace("_", " ")}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{notification.detail}</p>
                  <div className="mt-3">
                    {settings.notificationSettings.whatsappAlertsEnabled && whatsappLink ? (
                      <Button asChild>
                        <a href={whatsappLink} rel="noreferrer" target="_blank">
                          <MessageCircleMore className="h-4 w-4" />
                          Open in WhatsApp
                        </a>
                      </Button>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                        Enable WhatsApp alert links in notification settings and store your number in international format to use this.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="surface-panel-blue rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <SectionTitle icon={RadioTower} tone="blue">Platform pulse</SectionTitle>
            <CardDescription>High-level operating health across modules, using the same local development data plane the admin is currently running on.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="surface-panel-amber rounded-[22px] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">Launch culture</p>
                <Badge variant="success">{settings.platform.defaultCulture.replace("_", " ")}</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Reveal window {settings.platform.revealWindowHours.min}-{settings.platform.revealWindowHours.max} hours, booking gap {settings.platform.minBookingGapHours} hours.
              </p>
            </div>
            <div className="surface-panel-blue rounded-[22px] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">New registrations</p>
                <Badge variant="outline">
                  {rawNotificationStore.notifications.filter((item) => item.type === "priest_registration" || item.type === "user_registration").length}
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Recent incoming registrations are visible both in the inbox and in the priest/user queues.
              </p>
            </div>
            <div className={cn("rounded-[22px] p-4", bookingMetrics.refundCases > 0 ? "surface-panel-rose alert-ring-high" : "surface-panel")}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">Manual refunds</p>
                <Badge variant={bookingMetrics.refundCases > 0 ? "danger" : "outline"}>{bookingMetrics.refundCases}</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Refunds remain policy-snapshot-based and manual-first until live payment infrastructure is introduced.
              </p>
            </div>
            <div className={cn("rounded-[22px] p-4", payoutMetrics.pendingCount > 0 ? "surface-panel-green alert-ring-low" : "surface-panel")}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">Manual payouts</p>
                <Badge variant={payoutMetrics.pendingCount > 0 ? "success" : "outline"}>{payoutMetrics.pendingCount} pending</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Priest settlements stay manual-first with UPI details and payout confirmation in the payout workspace.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
        <Card className="surface-panel rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <SectionTitle icon={LayoutGrid}>Module quick access</SectionTitle>
            <CardDescription>Settings remain a module now. The landing route is operational and the modules stay task-specific.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {moduleStatus
              .filter((module) => module.key !== "dashboard")
              .map((module) => (
                <Link className={cn("group rounded-[22px] border border-border p-4 transition-colors hover:bg-secondary/30", moduleTone(module.key))} href={module.href as Route} key={module.key}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{module.title}</p>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.summary}</p>
                </Link>
              ))}
          </CardContent>
        </Card>

        <Card className="surface-panel-rose rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <SectionTitle icon={Siren} tone="rose">Hot alerts</SectionTitle>
                <CardDescription>Small actionable list for the highest-friction operational issues.</CardDescription>
              </div>
              <ShieldAlert className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookingStore.cases
              .filter((booking) => booking.replacementRequired || booking.pendingRefundAmount > 0 || booking.governance.whatsappConfirmationState === "failed")
              .slice(0, 4)
              .map((booking) => (
                <Link
                  className="block rounded-[22px] border border-border bg-white p-4 transition-colors hover:bg-secondary/30"
                  href={`/dashboard/bookings/${booking.id}` as Route}
                  key={booking.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{booking.bookingCode} - {booking.ritual}</p>
                    <Badge variant={booking.risk === "high" ? "danger" : booking.risk === "medium" ? "warning" : "info"}>{booking.risk} risk</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {booking.replacementRequired ? "Replacement required. " : ""}
                    {booking.pendingRefundAmount > 0 ? `Refund exposure Rs ${booking.pendingRefundAmount}. ` : ""}
                    WhatsApp state: {booking.governance.whatsappConfirmationState.replaceAll("_", " ")}.
                  </p>
                </Link>
              ))}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
