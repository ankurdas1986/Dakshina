import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type TierStatus = "active" | "planned";
export type RitualStatus = "active" | "draft";
export type DeliveryMode = "ui_only" | "ui_and_pdf";
export type PricingMode = "admin-guided" | "hybrid" | "contract";

export type RitualTier = {
  id: string;
  name: string;
  title: string;
  focus: string;
  status: TierStatus;
  pricingMode: PricingMode;
};

export type RitualCategory = {
  id: string;
  parentId: string | null;
  tierId: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
};

export type RitualRecord = {
  id: string;
  name: string;
  tierId: string;
  categoryId: string;
  status: RitualStatus;
  deliveryMode: DeliveryMode;
  pricingMode: PricingMode;
  fardTemplate: Record<string, unknown>;
};

export type RitualStore = {
  fardRules: string[];
  tiers: RitualTier[];
  categories: RitualCategory[];
  rituals: RitualRecord[];
};

const ritualFilePath = path.join(process.cwd(), "data", "rituals.json");

const fallbackStore: RitualStore = {
  fardRules: [
    "Every ritual keeps a JSON template for structured checklist management.",
    "Confirmed bookings store a Fard snapshot so later edits do not alter historical orders.",
    "Users can view or download the checklist after booking confirmation."
  ],
  tiers: [
    {
      id: "tier_1",
      name: "Tier 1",
      title: "Essential Home",
      focus: "Recurring household rituals such as Lakshmi and Satyanarayan puja.",
      status: "active",
      pricingMode: "admin-guided"
    },
    {
      id: "tier_2",
      name: "Tier 2",
      title: "Grand Event",
      focus: "Weddings, sacred thread, grihoprobesh, and milestone rituals.",
      status: "active",
      pricingMode: "hybrid"
    },
    {
      id: "tier_3",
      name: "Tier 3",
      title: "Barwari / Public",
      focus: "Community Durga, Kali, and locality-level puja management.",
      status: "active",
      pricingMode: "admin-guided"
    },
    {
      id: "tier_4",
      name: "Tier 4",
      title: "Monthly Trustee",
      focus: "Recurring temple, society, and complex priest scheduling.",
      status: "planned",
      pricingMode: "contract"
    }
  ],
  categories: [
    {
      id: "cat_001",
      parentId: null,
      tierId: "tier_1",
      name: "Home Puja",
      slug: "home-puja",
      description: "Recurring household puja categories.",
      displayOrder: 1
    },
    {
      id: "cat_002",
      parentId: "cat_001",
      tierId: "tier_1",
      name: "Prosperity Puja",
      slug: "prosperity-puja",
      description: "Lakshmi and wealth-related puja services.",
      displayOrder: 1
    },
    {
      id: "cat_003",
      parentId: "cat_001",
      tierId: "tier_1",
      name: "Household Rituals",
      slug: "household-rituals",
      description: "Routine family ritual services.",
      displayOrder: 2
    },
    {
      id: "cat_004",
      parentId: null,
      tierId: "tier_2",
      name: "Family Milestones",
      slug: "family-milestones",
      description: "Large family event categories.",
      displayOrder: 1
    },
    {
      id: "cat_005",
      parentId: "cat_004",
      tierId: "tier_2",
      name: "Marriage Ceremonies",
      slug: "marriage-ceremonies",
      description: "Wedding and marriage-related rituals.",
      displayOrder: 1
    },
    {
      id: "cat_006",
      parentId: "cat_004",
      tierId: "tier_2",
      name: "Life-cycle Events",
      slug: "life-cycle-events",
      description: "Thread ceremony, annaprashan, and family milestones.",
      displayOrder: 2
    },
    {
      id: "cat_007",
      parentId: null,
      tierId: "tier_3",
      name: "Community Puja",
      slug: "community-puja",
      description: "Public and barwari puja operations.",
      displayOrder: 1
    },
    {
      id: "cat_008",
      parentId: "cat_007",
      tierId: "tier_3",
      name: "Festival Committees",
      slug: "festival-committees",
      description: "Large committee-managed festival rituals.",
      displayOrder: 1
    }
  ],
  rituals: [
    {
      id: "ritual_001",
      name: "Lakshmi Puja",
      tierId: "tier_1",
      categoryId: "cat_002",
      status: "active",
      deliveryMode: "ui_and_pdf",
      pricingMode: "admin-guided",
      fardTemplate: {
        items: [
          { label: "Ghot", quantity: "1" },
          { label: "Mango leaves", quantity: "5" },
          { label: "Flowers", quantity: "As required" }
        ]
      }
    },
    {
      id: "ritual_002",
      name: "Wedding Ritual",
      tierId: "tier_2",
      categoryId: "cat_005",
      status: "active",
      deliveryMode: "ui_and_pdf",
      pricingMode: "hybrid",
      fardTemplate: {
        items: [
          { label: "Topor", quantity: "1" },
          { label: "Mala", quantity: "2" },
          { label: "Puja samagri set", quantity: "1" }
        ]
      }
    },
    {
      id: "ritual_003",
      name: "Durga Puja",
      tierId: "tier_3",
      categoryId: "cat_008",
      status: "draft",
      deliveryMode: "ui_only",
      pricingMode: "admin-guided",
      fardTemplate: {
        items: [
          { label: "Dhaak arrangement", quantity: "1" },
          { label: "Pushpanjali flowers", quantity: "Bulk" },
          { label: "Bhog ingredients", quantity: "Bulk" }
        ]
      }
    }
  ]
};

async function ensureDirectory() {
  await mkdir(path.dirname(ritualFilePath), { recursive: true });
}

async function writeStore(store: RitualStore) {
  await ensureDirectory();
  await writeFile(ritualFilePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function getRitualStore() {
  try {
    const raw = await readFile(ritualFilePath, "utf8");
    return JSON.parse(raw) as RitualStore;
  } catch {
    await writeStore(fallbackStore);
    return fallbackStore;
  }
}

export async function updateTier(input: RitualTier) {
  const current = await getRitualStore();
  const next: RitualStore = {
    ...current,
    tiers: current.tiers.map((tier) => (tier.id === input.id ? input : tier))
  };
  await writeStore(next);
  return next;
}

export async function updateCategory(input: RitualCategory) {
  const current = await getRitualStore();
  const next: RitualStore = {
    ...current,
    categories: current.categories.map((category) => (category.id === input.id ? input : category)),
    rituals: current.rituals.map((ritual) =>
      ritual.categoryId === input.id ? { ...ritual, tierId: input.tierId } : ritual
    )
  };
  await writeStore(next);
  return next;
}

export async function addCategory(input: Omit<RitualCategory, "id">) {
  const current = await getRitualStore();
  const nextId = `cat_${String(current.categories.length + 1).padStart(3, "0")}`;
  const next: RitualStore = {
    ...current,
    categories: [
      ...current.categories,
      {
        id: nextId,
        ...input
      }
    ]
  };
  await writeStore(next);
  return next;
}

export async function updateRitual(input: RitualRecord) {
  const current = await getRitualStore();
  const next: RitualStore = {
    ...current,
    rituals: current.rituals.map((ritual) => (ritual.id === input.id ? input : ritual))
  };
  await writeStore(next);
  return next;
}

export async function addRitual(input: Omit<RitualRecord, "id">) {
  const current = await getRitualStore();
  const nextId = `ritual_${String(current.rituals.length + 1).padStart(3, "0")}`;
  const next: RitualStore = {
    ...current,
    rituals: [
      ...current.rituals,
      {
        id: nextId,
        ...input
      }
    ]
  };
  await writeStore(next);
  return next;
}

export function getFardItemCount(template: Record<string, unknown>) {
  const items = template.items;
  return Array.isArray(items) ? items.length : 0;
}

export function buildCategoryLabel(categoryId: string, categories: RitualCategory[]) {
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const parts: string[] = [];
  let current = categoryMap.get(categoryId);

  while (current) {
    parts.unshift(current.name);
    current = current.parentId ? categoryMap.get(current.parentId) : undefined;
  }

  return parts.join(" / ");
}

export function getCategoryDepth(categoryId: string, categories: RitualCategory[]) {
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  let depth = 0;
  let current = categoryMap.get(categoryId);

  while (current?.parentId) {
    depth += 1;
    current = categoryMap.get(current.parentId);
  }

  return depth;
}

export function getChildCategories(parentId: string | null, categories: RitualCategory[]) {
  return categories
    .filter((category) => category.parentId === parentId)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
}

export function getLeafCategoryOptions(categories: RitualCategory[]) {
  const parentIds = new Set(categories.filter((category) => category.parentId).map((category) => category.parentId));
  return categories
    .filter((category) => !parentIds.has(category.id))
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name))
    .map((category) => ({
      value: category.id,
      label: buildCategoryLabel(category.id, categories)
    }));
}

export function getRitualMetrics(store: RitualStore) {
  return {
    serviceTiers: store.tiers.length,
    categoryCount: store.categories.length,
    ritualCount: store.rituals.length,
    fardTemplates: store.rituals.filter((ritual) => getFardItemCount(ritual.fardTemplate) > 0).length
  };
}
