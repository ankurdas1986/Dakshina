import type { Route } from "next";
import { ModuleRouteNav } from "../module-route-nav";

const items = [
  { href: "/dashboard/settings" as Route, label: "Overview" },
  { href: "/dashboard/settings/culture" as Route, label: "Culture rollout" },
  { href: "/dashboard/settings/commercial" as Route, label: "Commercial rules" },
  { href: "/dashboard/settings/governance" as Route, label: "Governance" },
  { href: "/dashboard/settings/districts" as Route, label: "District overrides" },
  { href: "/dashboard/settings/notifications" as Route, label: "Notifications" }
];

type SettingsRouteNavProps = {
  activeHref: string;
};

export function SettingsRouteNav({ activeHref }: SettingsRouteNavProps) {
  return <ModuleRouteNav activeHref={activeHref} items={items} />;
}
