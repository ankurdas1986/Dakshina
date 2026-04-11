import Link from "next/link";
import { ClipboardList, Package, Pencil, Plus, ArrowRight } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "../../../../components/ui/card";
import { CultureTabs } from "../../../../components/rituals/culture-tabs";
import { RitualPageShell } from "../../../../components/rituals/ritual-page-shell";
import { SectionTitle } from "../../../../components/ui/section-title";
import { getMasterSamagriStore } from "../../../../lib/master-samagri-store";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ culture?: string }>;

export default async function RitualSamagriPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const activeCulture = params.culture ?? "Bengali";
  const store = await getMasterSamagriStore();

  /* count per culture for the tab badges */
  const cultureCounts: Record<string, number> = {};
  for (const item of store.items) {
    cultureCounts[item.cultureType] = (cultureCounts[item.cultureType] ?? 0) + 1;
  }

  /* filter items by selected culture */
  const filteredItems = store.items
    .filter((item) => item.cultureType === activeCulture)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.itemName.localeCompare(b.itemName));

  /* group by ritual for nicely sectioned view */
  const ritualGroups = new Map<string, typeof filteredItems>();
  for (const item of filteredItems) {
    const key = item.ritualLabel;
    if (!ritualGroups.has(key)) ritualGroups.set(key, []);
    ritualGroups.get(key)!.push(item);
  }

  const cultureDisplayName = activeCulture.replace(/_/g, " ");

  return (
    <RitualPageShell
      activeHref="/dashboard/rituals/samagri"
      subtitle="Master samagri checklist indexed by culture and ritual. Select a culture tab to view and manage its samagri items."
      title="Samagri master"
    >
      {/* ─── Culture tab selector ─── */}
      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <SectionTitle icon={ClipboardList} tone="amber">Select culture</SectionTitle>
              <CardDescription className="mt-1">Choose a tradition to view its samagri checklist. Items are scoped by culture and ritual.</CardDescription>
            </div>
            <Badge variant="outline">{store.items.length} total items</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <CultureTabs
            activeCulture={activeCulture}
            basePath="/dashboard/rituals/samagri"
            counts={cultureCounts}
          />
        </CardContent>
      </Card>

      {/* ─── Items table for selected culture ─── */}
      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <SectionTitle icon={Package} tone="violet">
                {cultureDisplayName} samagri
              </SectionTitle>
              <CardDescription className="mt-1">
                {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} across {ritualGroups.size} ritual{ritualGroups.size !== 1 ? "s" : ""}. Click an item to edit.
              </CardDescription>
            </div>
            <Link href={`/dashboard/rituals/samagri/create?culture=${activeCulture}`}>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Add item
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-border bg-secondary/20 px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ClipboardList className="h-7 w-7" />
              </div>
              <p className="text-sm font-semibold text-foreground">No samagri items for {cultureDisplayName}</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Start by adding the first checklist item for this tradition.
              </p>
              <Link href={`/dashboard/rituals/samagri/create?culture=${activeCulture}`} className="mt-5">
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  Create first item
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(ritualGroups.entries()).map(([ritualLabel, items]) => (
                <div key={ritualLabel}>
                  {/* Ritual group header */}
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="text-sm font-bold tracking-tight text-foreground">{ritualLabel}</h3>
                    <div className="h-px flex-1 bg-border" />
                    <Badge variant="outline">{items.length} items</Badge>
                  </div>

                  {/* Table */}
                  <div className="overflow-hidden rounded-2xl border border-border">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border bg-gradient-to-b from-secondary/60 to-secondary/30">
                          <th className="px-4 py-3 font-semibold text-muted-foreground">Item name</th>
                          <th className="px-4 py-3 font-semibold text-muted-foreground">Local name</th>
                          <th className="hidden px-4 py-3 text-center font-semibold text-muted-foreground sm:table-cell">Qty</th>
                          <th className="hidden px-4 py-3 font-semibold text-muted-foreground sm:table-cell">Unit</th>
                          <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
                          <th className="px-4 py-3 text-right font-semibold text-muted-foreground">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, idx) => (
                          <tr
                            key={item.id}
                            className={`group transition-colors hover:bg-primary/[0.03] ${idx < items.length - 1 ? "border-b border-border/60" : ""}`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{item.itemName}</span>
                                {item.isOptional ? (
                                  <Badge variant="secondary" className="text-[10px]">optional</Badge>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {item.localName ? (
                                <span className="text-base font-medium text-foreground/80">{item.localName}</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="hidden px-4 py-3 text-center tabular-nums text-foreground sm:table-cell">
                              {item.defaultQuantity}
                            </td>
                            <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                              {item.unit}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant={item.isActive ? "success" : "secondary"}>
                                {item.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link
                                href={`/dashboard/rituals/samagri/${item.id}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </RitualPageShell>
  );
}
