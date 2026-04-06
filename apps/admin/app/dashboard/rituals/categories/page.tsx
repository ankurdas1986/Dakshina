import { deleteCategory, saveCategory } from "../../../actions/rituals";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { FormActions } from "../../../../components/ui/form-actions";
import { Input } from "../../../../components/ui/input";
import { RitualField, RitualSelectField, RitualTextAreaField } from "../../../../components/rituals/fields";
import { RitualPageShell } from "../../../../components/rituals/ritual-page-shell";
import {
  buildCategoryLabel,
  getCategoriesByCulture,
  getCategoryDepth,
  getChildCategories,
  getRitualStore,
  type CategoryNodeType,
  type RitualStore
} from "../../../../lib/ritual-store";
import type { CultureType } from "../../../../lib/settings";

export const dynamic = "force-dynamic";

const cultureOptions: Array<{ value: string; label: string }> = [
  { value: "Bengali", label: "Bengali" },
  { value: "North_Indian", label: "North Indian" },
  { value: "Marwadi", label: "Marwadi" },
  { value: "Odia", label: "Odia" },
  { value: "Gujarati", label: "Gujarati" }
];

const nodeTypeOptions: Array<{ value: CategoryNodeType; label: string }> = [
  { value: "tradition", label: "Tradition" },
  { value: "service_type", label: "Service type" },
  { value: "sub_type", label: "Specific ritual group" }
];

function formatCulture(cultureType: CultureType) {
  return cultureType.replace("_", " ");
}

export default async function RitualCategoriesPage() {
  const store = await getRitualStore();
  const groupedCategories = getCategoriesByCulture(store.categories);
  const cultures = cultureOptions.map((option) => option.value as CultureType);

  return (
    <RitualPageShell
      activeHref="/dashboard/rituals/categories"
      subtitle="Manage the hierarchical culture tree here. This route is only for category structure, not ritual template editing."
      title="Category tree"
    >
      <Card className="rounded-[28px] border-border/80 bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Culture category tree</CardTitle>
          <CardDescription>Tradition - service type - ritual grouping is edited here with dependency-safe delete actions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {cultures.map((cultureType) => {
            const cultureRoots = getChildCategories(null, groupedCategories[cultureType]);
            if (!cultureRoots.length) return null;

            return (
              <div className="space-y-3" key={cultureType}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{formatCulture(cultureType)}</p>
                  <Badge variant={cultureType === "Bengali" ? "success" : "outline"}>{cultureRoots.length} root nodes</Badge>
                </div>
                {cultureRoots.map((category) => (
                  <CategoryBranch categoryId={category.id} key={category.id} store={store} />
                ))}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </RitualPageShell>
  );
}

function CategoryBranch({ categoryId, store }: { categoryId: string; store: RitualStore }) {
  const category = store.categories.find((item) => item.id === categoryId);
  if (!category) return null;

  const depth = getCategoryDepth(category.id, store.categories);
  const children = getChildCategories(category.id, store.categories);
  const tier = store.tiers.find((item) => item.id === category.tierId);
  const linkedRituals = store.rituals.filter((ritual) => ritual.categoryId === category.id);

  return (
    <div className="space-y-3">
      <form action={saveCategory} className="rounded-[24px] border border-border bg-white p-4">
        <input name="id" type="hidden" value={category.id} />
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{buildCategoryLabel(category.id, store.categories)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Depth {depth + 1} | {formatCulture(category.cultureType)} | {tier?.name ?? category.tierId}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{category.nodeType.replace("_", " ")}</Badge>
            <Badge variant={children.length > 0 ? "outline" : "secondary"}>{children.length > 0 ? `${children.length} sub-categories` : "leaf category"}</Badge>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
          <RitualField label="Category name"><Input defaultValue={category.name} name="name" required /></RitualField>
          <RitualField label="Slug"><Input defaultValue={category.slug} name="slug" /></RitualField>
          <RitualSelectField label="Culture" name="cultureType" defaultValue={category.cultureType} options={cultureOptions} />
          <RitualSelectField label="Node type" name="nodeType" defaultValue={category.nodeType} options={nodeTypeOptions.map((option) => ({ value: option.value, label: option.label }))} />
          <div className="md:col-span-2">
            <RitualSelectField label="Parent category" name="parentId" defaultValue={category.parentId ?? ""} options={[{ value: "", label: "No parent (root category)" }, ...store.categories.filter((item) => item.id !== category.id).map((item) => ({ value: item.id, label: `${formatCulture(item.cultureType)}: ${buildCategoryLabel(item.id, store.categories)}` }))]} />
          </div>
          <RitualSelectField label="Tier" name="tierId" defaultValue={category.tierId} options={store.tiers.map((tierItem) => ({ value: tierItem.id, label: `${tierItem.name}: ${tierItem.title}` }))} />
          <RitualField label="Display order"><Input defaultValue={category.displayOrder} min={1} name="displayOrder" type="number" /></RitualField>
          <div className="md:col-span-2 xl:col-span-2"><RitualTextAreaField label="Description" name="description" defaultValue={category.description} /></div>
          {linkedRituals.length > 0 ? (
            <div className="rounded-[20px] border border-dashed border-border bg-primary/5 px-4 py-3 text-sm text-muted-foreground md:col-span-2 xl:col-span-2">
              Linked rituals: {linkedRituals.map((ritual) => `${ritual.name} (${formatCulture(ritual.cultureType)})`).join(", ")}
            </div>
          ) : null}
          <FormActions className="md:col-span-2 xl:col-span-2">
            <button className="inline-flex h-10 items-center justify-center rounded-xl border border-destructive/30 px-4 text-sm font-semibold text-destructive transition hover:bg-destructive/5" formAction={deleteCategory} type="submit">
              Delete category
            </button>
            <Button type="submit">Save category</Button>
          </FormActions>
        </div>
      </form>
      {children.length > 0 ? (
        <div className="space-y-3 border-l border-border/80 pl-4">
          {children.map((child) => (
            <CategoryBranch categoryId={child.id} key={child.id} store={store} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
