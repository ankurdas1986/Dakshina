import type { ReactNode } from "react";
import { AdminShell } from "../admin-shell";
import { RitualRouteNav } from "./ritual-route-nav";
import { getAdminShellData } from "../../lib/admin-shell-data";
import { requireAdminUser } from "../../lib/auth";

type RitualPageShellProps = {
  activeHref: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export async function RitualPageShell({ activeHref, title, subtitle, children }: RitualPageShellProps) {
  const user = await requireAdminUser();
  const { notifications, notificationCount, notificationEnabled } = await getAdminShellData();

  return (
    <AdminShell
      active="rituals"
      notificationCount={notificationCount}
      notificationEnabled={notificationEnabled}
      notifications={notifications}
      subtitle={subtitle}
      title={title}
      userEmail={user.email}
      subnav={<RitualRouteNav activeHref={activeHref} />}
    >
      {children}
    </AdminShell>
  );
}
