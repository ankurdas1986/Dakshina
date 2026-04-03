"use client";

import { useMemo, useState } from "react";

type CategoryOption = {
  id: string;
  name: string;
  parentId: string | null;
};

type RitualOption = {
  id: string;
  name: string;
  categoryId: string;
};

type PriestServiceSelectorProps = {
  categories: CategoryOption[];
  rituals: RitualOption[];
  defaultMainCategoryId: string | null;
  defaultServiceCategoryId: string | null;
  defaultRitualIds: string[];
};

function sortCategories(categories: CategoryOption[]) {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name));
}

function getCategoryChildren(categories: CategoryOption[], parentId: string | null) {
  return sortCategories(categories.filter((category) => category.parentId === parentId));
}

function buildDefaultPath(
  categories: CategoryOption[],
  mainCategoryId: string | null,
  serviceCategoryId: string | null
) {
  if (!mainCategoryId) {
    return [];
  }

  const path = [mainCategoryId];
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  let currentId = serviceCategoryId;
  const branch: string[] = [];

  while (currentId) {
    const current = categoryMap.get(currentId);

    if (!current || !current.parentId) {
      break;
    }

    branch.unshift(current.id);
    currentId = current.parentId;
  }

  return [...path, ...branch.filter((id) => id !== mainCategoryId)];
}

export function PriestServiceSelector({
  categories,
  rituals,
  defaultMainCategoryId,
  defaultServiceCategoryId,
  defaultRitualIds
}: PriestServiceSelectorProps) {
  const [categoryPath, setCategoryPath] = useState<string[]>(
    buildDefaultPath(categories, defaultMainCategoryId, defaultServiceCategoryId)
  );
  const [selectedRitualIds, setSelectedRitualIds] = useState<string[]>(defaultRitualIds);

  const mainCategoryId = categoryPath[0] ?? "";
  const serviceCategoryId = categoryPath[categoryPath.length - 1] ?? "";

  const categoryLevels = useMemo(() => {
    const levels: CategoryOption[][] = [];
    let parentId: string | null = null;

    for (;;) {
      const nextLevel = getCategoryChildren(categories, parentId);

      if (nextLevel.length === 0) {
        break;
      }

      levels.push(nextLevel);
      const selectedForLevel = categoryPath[levels.length - 1];

      if (!selectedForLevel) {
        break;
      }

      parentId = selectedForLevel;
    }

    return levels;
  }, [categories, categoryPath]);

  const availableRituals = useMemo(() => {
    if (!serviceCategoryId) {
      return [];
    }

    return rituals.filter((ritual) => ritual.categoryId === serviceCategoryId);
  }, [rituals, serviceCategoryId]);

  function updateLevel(levelIndex: number, value: string) {
    setCategoryPath((current) => {
      const next = current.slice(0, levelIndex);
      if (value) {
        next[levelIndex] = value;
      }
      return next;
    });
    setSelectedRitualIds([]);
  }

  function toggleRitual(ritualId: string, checked: boolean) {
    setSelectedRitualIds((current) => {
      if (checked) {
        return current.includes(ritualId) ? current : [...current, ritualId];
      }

      return current.filter((item) => item !== ritualId);
    });
  }

  return (
    <div className="space-y-3 rounded-[22px] border border-border bg-primary/5 p-4">
      <input name="mainCategoryId" type="hidden" value={mainCategoryId} />
      <input name="serviceCategoryId" type="hidden" value={serviceCategoryId} />
      <input name="ritualIds" type="hidden" value={selectedRitualIds.join(",")} />

      <div className="grid gap-3">
        {categoryLevels.map((level, index) => {
          const selectedValue = categoryPath[index] ?? "";
          const label = index === 0 ? "Main category" : `Sub-category ${index}`;

          return (
            <label className="grid gap-2 text-sm font-semibold text-foreground" key={`level-${index}`}>
              <span className="block leading-5">{label}</span>
              <select
                className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                onChange={(event) => updateLevel(index, event.target.value)}
                value={selectedValue}
              >
                <option value="">{index === 0 ? "Select main category" : "Select sub-category"}</option>
                {level.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>

      <div className="rounded-[18px] border border-border bg-white p-4">
        {serviceCategoryId ? (
          <div className="mb-3 rounded-[16px] border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground">
            Selected category path:{" "}
            <span className="font-semibold">
              {categoryPath
                .map((id) => categories.find((category) => category.id === id)?.name)
                .filter(Boolean)
                .join(" / ")}
            </span>
          </div>
        ) : null}
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Ritual selection</p>
        {availableRituals.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {availableRituals.map((ritual) => (
              <label className="flex items-center gap-3 rounded-[16px] border border-border px-3 py-2 text-sm text-foreground" key={ritual.id}>
                <input
                  checked={selectedRitualIds.includes(ritual.id)}
                  className="h-4 w-4 accent-[hsl(var(--primary))]"
                  onChange={(event) => toggleRitual(ritual.id, event.target.checked)}
                  type="checkbox"
                />
                <span>{ritual.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Walk the category tree first, then select the rituals this priest performs.
          </p>
        )}
      </div>
    </div>
  );
}

