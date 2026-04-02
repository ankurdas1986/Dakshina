import { FileJson2, Layers3, ScrollText } from "lucide-react";
import { AdminShell } from "../../../components/admin-shell";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { ritualSnapshot } from "../../../lib/admin-data";
import { requireAdminUser } from "../../../lib/auth";

const metrics = [
  { label: "Service tiers", value: ritualSnapshot.categories.length, icon: Layers3 },
  { label: "Featured rituals", value: ritualSnapshot.featuredRituals.length, icon: ScrollText },
  { label: "Fard templates", value: ritualSnapshot.categories.reduce((total, item) => total + item.fardTemplates, 0), icon: FileJson2 }
];

export default async function RitualsPage() {
  const user = await requireAdminUser();

  return (
    <AdminShell
      active="rituals"
      subtitle="Admin controls the ritual catalog, the official 4-tier model, and JSON-based Fard templates for confirmed bookings."
      title="Rituals and Fard"
      userEmail={user.email}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card className="rounded-[24px] border-border/80 bg-white" key={metric.label}>
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{metric.label}</p>
                  <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">{metric.value}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 p-2.5">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Official service structure</CardTitle>
            <CardDescription>Tier definitions are standardized and remain admin-managed.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[440px] space-y-3 overflow-y-auto pr-2 surface-scroll">
            {ritualSnapshot.categories.map((category) => (
              <div className="rounded-[24px] border border-border bg-white p-4" key={category.tier}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{category.tier}: {category.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {category.rituals} rituals, {category.fardTemplates} Fard templates, pricing mode {category.pricingMode}.
                    </p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Fard operating rules</CardTitle>
            <CardDescription>Booking confirmation triggers checklist availability for the user.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[440px] space-y-3 overflow-y-auto pr-2 surface-scroll">
            {ritualSnapshot.fardRules.map((rule) => (
              <div className="rounded-[20px] border border-border bg-white p-4" key={rule}>
                <p className="text-sm leading-6 text-muted-foreground">{rule}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Featured ritual templates</CardTitle>
          <CardDescription>Each ritual keeps structured checklist data and delivery mode visibility.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          {ritualSnapshot.featuredRituals.map((ritual) => (
            <div className="rounded-[24px] border border-border bg-white p-4" key={ritual.ritual}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">{ritual.ritual}</p>
                <Badge variant={ritual.status === "active" ? "success" : "secondary"}>{ritual.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Tier: {ritual.tier}</p>
              <p className="mt-1 text-sm text-muted-foreground">Fard items: {ritual.fardItems}</p>
              <p className="mt-1 text-sm text-muted-foreground">Delivery: {ritual.delivery}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminShell>
  );
}

