import type { Route } from "next";
import { ModuleRouteNav } from "../module-route-nav";

const items = [
  { href: "/dashboard/rituals" as Route, label: "Overview" },
  { href: "/dashboard/rituals/categories" as Route, label: "Category tree" },
  { href: "/dashboard/rituals/library" as Route, label: "Ritual library" },
  { href: "/dashboard/rituals/create" as Route, label: "Create" },
  { href: "/dashboard/rituals/panjika" as Route, label: "Panjika" },
  { href: "/dashboard/rituals/fard" as Route, label: "Fard" }
];

type RitualRouteNavProps = {
  activeHref: string;
};

export function RitualRouteNav({ activeHref }: RitualRouteNavProps) {
  return <ModuleRouteNav activeHref={activeHref} items={items} />;
}
