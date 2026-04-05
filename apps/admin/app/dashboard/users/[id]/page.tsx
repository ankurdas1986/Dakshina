import type { Route } from "next";
import Link from "next/link";
import { ChevronLeft, Shield, Wallet } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminShell } from "../../../../components/admin-shell";
import { UserDetailPanel, getUserStatusVariant } from "../../../../components/users/user-detail-panel";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { getAdminShellData } from "../../../../lib/admin-shell-data";
import { requireAdminUser } from "../../../../lib/auth";
import { getBookingStore } from "../../../../lib/booking-store";
import { getUserStore } from "../../../../lib/user-store";
import { getWalletStore } from "../../../../lib/wallet-store";

export const dynamic = "force-dynamic";

type UserDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

const messageMap: Record<string, string> = {
  user_saved: "User profile updated and stored for local UAT."
};

export default async function UserDetailPage({ params, searchParams }: UserDetailPageProps) {
  const user = await requireAdminUser();
  const { notifications, notificationCount, notificationEnabled } = await getAdminShellData();
  const { id } = await params;
  const store = await getUserStore();
  const walletStore = await getWalletStore();
  const bookingStore = await getBookingStore();
  const record = store.users.find((entry) => entry.id === id);

  if (!record) {
    notFound();
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const messageKey = readParam(resolvedSearchParams, "message");
  const bannerMessage = messageKey ? messageMap[messageKey] ?? null : null;
  const bookingHistory = bookingStore.cases.filter((entry) => entry.userId === record.id || record.bookingIds.includes(entry.id));
  const transactionLogs = walletStore.transactions.filter((entry) => entry.userId === record.id);

  return (
    <AdminShell
      active="users"
      notificationCount={notificationCount}
      notificationEnabled={notificationEnabled}
      notifications={notifications}
      breadcrumbs={
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link className="inline-flex items-center gap-2 font-medium text-foreground hover:text-primary" href={"/dashboard/users" as Route}>
            <ChevronLeft className="h-4 w-4" />
            Back to user queue
          </Link>
          <span>/</span>
          <span>{record.fullName}</span>
        </div>
      }
      subtitle="Use this workspace to control the full user lifecycle, from profile corrections to wallet and booking oversight."
      title="User Control"
      userEmail={user.email}
      subnav={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={getUserStatusVariant(record.accountStatus)}>{record.accountStatus}</Badge>
          <Badge variant="outline">{record.traditionPreference.replace("_", " ")}</Badge>
          <Badge variant="outline">Wallet Rs {record.walletBalance}</Badge>
        </div>
      }
    >
      {bannerMessage ? (
        <div className="rounded-[24px] border border-success/20 bg-success/10 px-4 py-3 text-sm font-medium text-success">{bannerMessage}</div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Operational summary</CardTitle>
            <CardDescription>Review account state before editing history, wallet, or lifecycle controls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] border border-border bg-secondary/30 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">User profile</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{record.fullName}</p>
              <p className="mt-1 text-sm text-muted-foreground">{record.email}</p>
            </div>
            <div className="rounded-[24px] border border-border bg-secondary/30 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Lifecycle control</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">Block, deactivate, or reactivate this user without leaving the detail page.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] border border-border bg-secondary/30 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Wallet className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Wallet governance</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">Wallet balance and advance-payment logs remain visible for manual oversight.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Detail workspace</CardTitle>
            <CardDescription>All profile, wallet, and status edits for this user live here.</CardDescription>
          </CardHeader>
          <CardContent className="surface-scroll overflow-y-auto pr-2 xl:max-h-[980px]">
            <UserDetailPanel bookingHistory={bookingHistory} returnTo={`/dashboard/users/${record.id}`} transactionLogs={transactionLogs} user={record} />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
