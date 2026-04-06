import type { ReactNode } from "react";
import { AdminShell } from "../admin-shell";
import { SettingsRouteNav } from "./settings-route-nav";
import { getAdminShellData } from "../../lib/admin-shell-data";
import { requireAdminUser } from "../../lib/auth";

type SettingsPageShellProps = {
  activeHref: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export async function SettingsPageShell({ activeHref, title, subtitle, children }: SettingsPageShellProps) {
  const user = await requireAdminUser();
  const { notifications, notificationCount, notificationEnabled } = await getAdminShellData();

  return (
    <AdminShell
      active="settings"
      notificationCount={notificationCount}
      notificationEnabled={notificationEnabled}
      notifications={notifications}
      subtitle={subtitle}
      title={title}
      userEmail={user.email}
      subnav={<SettingsRouteNav activeHref={activeHref} />}
    >
      {children}
    </AdminShell>
  );
}
