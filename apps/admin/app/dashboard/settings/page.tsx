import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function SettingsRootPage() {
  redirect("/dashboard/settings/culture");
}
