import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function RitualCreateRedirectPage() {
  redirect("/dashboard/rituals/categories");
}
