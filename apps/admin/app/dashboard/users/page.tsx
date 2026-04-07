import type { Route } from "next";
import Link from "next/link";
import { CircleUserRound, MapPinned, PlusCircle, Search, Shield, UserPlus, Wallet } from "lucide-react";
import { createUserRecord } from "../../actions/users";
import { AdminShell } from "../../../components/admin-shell";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "../../../components/ui/card";
import { FormActions } from "../../../components/ui/form-actions";
import { Input } from "../../../components/ui/input";
import { KpiCard } from "../../../components/ui/kpi-card";
import { SectionTitle } from "../../../components/ui/section-title";
import { getAdminShellData } from "../../../lib/admin-shell-data";
import { requireAdminUser } from "../../../lib/auth";
import { getUserMetrics, getUserStore } from "../../../lib/user-store";

export const dynamic = "force-dynamic";

type UsersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const messageMap: Record<string, string> = {
  user_saved: "User profile updated and stored for local UAT.",
  user_created: "User profile created and added to the queue."
};

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function getUserStatusVariant(status: string) {
  if (status === "active") {
    return "success" as const;
  }

  if (status === "blocked") {
    return "secondary" as const;
  }

  return "outline" as const;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const user = await requireAdminUser();
  const { notifications, notificationCount, notificationEnabled } = await getAdminShellData();
  const store = await getUserStore();
  const metrics = getUserMetrics(store);
  const resolvedSearchParams = (await searchParams) ?? {};
  const messageKey = readParam(resolvedSearchParams, "message");
  const bannerMessage = messageKey ? messageMap[messageKey] ?? null : null;
  const query = readParam(resolvedSearchParams, "q")?.toLowerCase() ?? "";
  const traditionFilter = readParam(resolvedSearchParams, "culture") ?? "all";
  const statusFilter = readParam(resolvedSearchParams, "status") ?? "all";
  const areaFilter = readParam(resolvedSearchParams, "area")?.toLowerCase() ?? "";

  const filteredUsers = store.users.filter((entry) => {
    const matchesQuery =
      !query ||
      [entry.fullName, entry.phone, entry.email, entry.address, entry.district, entry.locality]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesCulture = traditionFilter === "all" || entry.traditionPreference === traditionFilter;
    const matchesStatus = statusFilter === "all" || entry.accountStatus === statusFilter;
    const matchesArea = !areaFilter || [entry.district, entry.locality, entry.address].join(" ").toLowerCase().includes(areaFilter);
    return matchesQuery && matchesCulture && matchesStatus && matchesArea;
  });

  return (
    <AdminShell
      active="users"
      notificationCount={notificationCount}
      notificationEnabled={notificationEnabled}
      notifications={notifications}
      subtitle="Full user governance console. Search, inspect booking and transaction history, and change account lifecycle state from a clean list-first workflow."
      title="User Management"
      userEmail={user.email}
    >
      {bannerMessage ? (
        <div className="rounded-[24px] border border-success/20 bg-success/10 px-4 py-3 text-sm font-medium text-success">{bannerMessage}</div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total users", value: metrics.totalUsers, icon: CircleUserRound, tone: "blue" as const, detail: "All user accounts currently available to operations." },
          { label: "Active", value: metrics.activeUsers, icon: Shield, tone: "green" as const, detail: "Accounts currently allowed to place and manage bookings." },
          { label: "Blocked", value: metrics.blockedUsers, icon: Shield, tone: "rose" as const, detail: "Accounts restricted by admin governance controls." },
          { label: "Wallet users", value: metrics.walletUsers, icon: Wallet, tone: "violet" as const, detail: "Users currently carrying wallet or credit-ledger activity." }
        ].map((metric) => (
          <KpiCard detail={metric.detail} icon={metric.icon} key={metric.label} label={metric.label} tone={metric.tone} value={metric.value} />
        ))}
      </div>

      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <SectionTitle icon={UserPlus} tone="amber">Create user profile</SectionTitle>
              <CardDescription>Manual user creation for support-led onboarding, corrections, or assisted bookings.</CardDescription>
            </div>
            <PlusCircle className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <form action={createUserRecord} className="grid gap-3 lg:grid-cols-2">
            <Input className="h-11 rounded-lg" name="fullName" placeholder="Full name" required />
            <Input className="h-11 rounded-lg" name="email" placeholder="Email" required />
            <Input className="h-11 rounded-lg" name="phone" placeholder="Phone" required />
            <Input className="h-11 rounded-lg" name="walletBalance" placeholder="Wallet balance" type="number" />
            <Input className="h-11 rounded-lg" name="district" placeholder="District" required />
            <Input className="h-11 rounded-lg" name="locality" placeholder="Locality" required />
            <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground" defaultValue="Bengali" name="traditionPreference">
              <option value="Bengali">Bengali</option>
              <option value="North_Indian">North Indian</option>
              <option value="Marwadi">Marwadi</option>
              <option value="Odia">Odia</option>
              <option value="Gujarati">Gujarati</option>
            </select>
            <Input className="h-11 rounded-lg" name="address" placeholder="Address" required />
            <textarea className="min-h-24 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground lg:col-span-2" name="notes" placeholder="Admin note" />
            <FormActions className="lg:col-span-2">
              <Button type="submit">Create user</Button>
            </FormActions>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader className="space-y-4">
          <div>
            <SectionTitle icon={MapPinned} tone="blue">User governance queue</SectionTitle>
            <CardDescription>Search by name, phone, area, and culture preference. Open a row to edit the full lifecycle record.</CardDescription>
          </div>
          <form className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_0.9fr_0.9fr_1fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-11 rounded-lg pl-9" defaultValue={query} name="q" placeholder="Search user, phone, email..." />
            </label>
            <Input className="h-11 rounded-lg" defaultValue={areaFilter} name="area" placeholder="Area / locality" />
            <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground" defaultValue={traditionFilter} name="culture">
              <option value="all">All traditions</option>
              <option value="Bengali">Bengali</option>
              <option value="North_Indian">North Indian</option>
              <option value="Marwadi">Marwadi</option>
              <option value="Odia">Odia</option>
              <option value="Gujarati">Gujarati</option>
            </select>
            <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground" defaultValue={statusFilter} name="status">
              <option value="all">All status</option>
              <option value="active">active</option>
              <option value="blocked">blocked</option>
              <option value="deactivated">deactivated</option>
            </select>
            <Button className="h-11 rounded-lg" type="submit">Apply</Button>
          </form>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3 p-4 xl:hidden">
            {filteredUsers.length ? filteredUsers.map((entry) => (
              <Link
                className="block rounded-[24px] border border-border bg-white p-4 transition-colors hover:bg-secondary/35"
                href={`/dashboard/users/${entry.id}` as Route}
                key={entry.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{entry.fullName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{entry.phone}</p>
                  </div>
                  <Badge variant={getUserStatusVariant(entry.accountStatus)}>{entry.accountStatus}</Badge>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <p className="text-foreground">{entry.locality}, {entry.district}</p>
                  <p className="text-muted-foreground">{entry.traditionPreference.replace("_", " ")}</p>
                  <p className="text-muted-foreground">Wallet Rs {entry.walletBalance}</p>
                </div>
              </Link>
            )) : (
              <div className="rounded-[24px] border border-border bg-white px-4 py-10 text-center text-sm text-muted-foreground">No users match the current filters.</div>
            )}
          </div>
          <div className="hidden overflow-x-auto xl:block">
          <div className="min-w-[1120px]">
            <div className="grid grid-cols-[1.2fr_1.05fr_0.95fr_0.8fr_0.75fr_0.7fr] gap-3 border-b border-border px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              <span>User</span>
              <span>Area</span>
              <span>Tradition</span>
              <span>Status</span>
              <span>Wallet</span>
              <span className="text-right">Action</span>
            </div>
            {filteredUsers.length ? filteredUsers.map((entry) => (
              <Link className="grid grid-cols-[1.2fr_1.05fr_0.95fr_0.8fr_0.75fr_0.7fr] gap-3 border-b border-border px-5 py-4 transition-colors hover:bg-secondary/35" href={`/dashboard/users/${entry.id}` as Route} key={entry.id}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{entry.fullName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{entry.phone}</p>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPinned className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{entry.locality}, {entry.district}</span>
                </div>
                <div className="text-sm text-foreground">{entry.traditionPreference.replace("_", " ")}</div>
                <div><Badge variant={getUserStatusVariant(entry.accountStatus)}>{entry.accountStatus}</Badge></div>
                <div className="text-sm font-semibold text-foreground">Rs {entry.walletBalance}</div>
                <div className="flex justify-end"><span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground">Open</span></div>
              </Link>
            )) : (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">No users match the current filters.</div>
            )}
          </div>
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
