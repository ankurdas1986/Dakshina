import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CultureType } from "./settings";

export type TierStatus = "active" | "planned";
export type RitualStatus = "active" | "draft";
export type DeliveryMode = "ui_only" | "ui_and_pdf";
export type PricingMode = "admin-guided" | "hybrid" | "contract";
export type CategoryNodeType = "tradition" | "service_type" | "sub_type";

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
  cultureType: CultureType;
  nodeType: CategoryNodeType;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
};

export type PanjikaResearch = {
  cultureType: CultureType;
  sources: string[];
  adminInstruction: string;
  sampleRituals: string[];
};

export type RitualRecord = {
  id: string;
  name: string;
  tierId: string;
  cultureType: CultureType;
  categoryId: string;
  status: RitualStatus;
  deliveryMode: DeliveryMode;
  pricingMode: PricingMode;
  durationMinutes: number;
  homepageRank: number | null;
  demandLabel: string;
  pricing: {
    dakshinaAmount: number;
    samagriAddOns: number;
    zoneWiseTravelFee: number;
    peakMultiplier: number;
  };
  fardTemplate: Record<string, unknown>;
};

export type RitualStore = {
  fardRules: string[];
  tiers: RitualTier[];
  categories: RitualCategory[];
  rituals: RitualRecord[];
  panjikaResearch: PanjikaResearch[];
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
    { id: "cat_001", parentId: null, tierId: "tier_1", cultureType: "Bengali", nodeType: "tradition", name: "Bengali", slug: "bengali", description: "Primary Bengali tradition tree.", displayOrder: 1 },
    { id: "cat_002", parentId: "cat_001", tierId: "tier_1", cultureType: "Bengali", nodeType: "service_type", name: "Home Puja", slug: "bengali-home-puja", description: "Bengali household pujas.", displayOrder: 1 },
    { id: "cat_003", parentId: "cat_002", tierId: "tier_1", cultureType: "Bengali", nodeType: "sub_type", name: "Prosperity Puja", slug: "bengali-prosperity-puja", description: "Lakshmi, Kojagari, and prosperity rituals.", displayOrder: 1 },
    { id: "cat_004", parentId: null, tierId: "tier_2", cultureType: "Bengali", nodeType: "tradition", name: "Bengali Marriage", slug: "bengali-marriage", description: "Bengali wedding and lifecycle rituals.", displayOrder: 2 },
    { id: "cat_005", parentId: "cat_004", tierId: "tier_2", cultureType: "Bengali", nodeType: "service_type", name: "Marriage", slug: "bengali-marriage-service", description: "Bengali marriage event blocks.", displayOrder: 1 },
    { id: "cat_006", parentId: "cat_005", tierId: "tier_2", cultureType: "Bengali", nodeType: "sub_type", name: "Wedding Rituals", slug: "bengali-wedding-rituals", description: "Gaye Holud, Bou Bhat, Sindoor Daan style Bengali flows.", displayOrder: 1 },
    { id: "cat_007", parentId: null, tierId: "tier_2", cultureType: "North_Indian", nodeType: "tradition", name: "North Indian", slug: "north-indian", description: "UP/Bihar rooted ritual tree.", displayOrder: 1 },
    { id: "cat_008", parentId: "cat_007", tierId: "tier_2", cultureType: "North_Indian", nodeType: "service_type", name: "Marriage", slug: "north-indian-marriage", description: "North Indian marriage services.", displayOrder: 1 },
    { id: "cat_009", parentId: "cat_008", tierId: "tier_2", cultureType: "North_Indian", nodeType: "sub_type", name: "Sindoor Daan", slug: "north-indian-sindoor-daan", description: "Marriage ritual specialization.", displayOrder: 1 },
    { id: "cat_010", parentId: null, tierId: "tier_2", cultureType: "Odia", nodeType: "tradition", name: "Odia", slug: "odia", description: "Odia ritual tree.", displayOrder: 1 },
    { id: "cat_011", parentId: "cat_010", tierId: "tier_2", cultureType: "Odia", nodeType: "service_type", name: "Marriage", slug: "odia-marriage", description: "Odia marriage service group.", displayOrder: 1 },
    { id: "cat_012", parentId: "cat_011", tierId: "tier_2", cultureType: "Odia", nodeType: "sub_type", name: "Hastagranthi", slug: "odia-hastagranthi", description: "Odia marriage ritual specialization.", displayOrder: 1 },
    { id: "cat_013", parentId: null, tierId: "tier_2", cultureType: "Gujarati", nodeType: "tradition", name: "Gujarati", slug: "gujarati", description: "Gujarati ritual tree.", displayOrder: 1 },
    { id: "cat_014", parentId: "cat_013", tierId: "tier_2", cultureType: "Gujarati", nodeType: "service_type", name: "Home Ritual", slug: "gujarati-home-ritual", description: "Gujarati home and vastu rituals.", displayOrder: 1 },
    { id: "cat_015", parentId: "cat_014", tierId: "tier_2", cultureType: "Gujarati", nodeType: "sub_type", name: "Vastu Shanti", slug: "gujarati-vastu-shanti", description: "Vastu and griha rituals in Gujarati style.", displayOrder: 1 },
    { id: "cat_016", parentId: null, tierId: "tier_2", cultureType: "Marwadi", nodeType: "tradition", name: "Marwadi", slug: "marwadi", description: "Marwadi ritual tree.", displayOrder: 1 },
    { id: "cat_017", parentId: "cat_016", tierId: "tier_2", cultureType: "Marwadi", nodeType: "service_type", name: "Marriage", slug: "marwadi-marriage", description: "Marwadi family event rituals.", displayOrder: 1 },
    { id: "cat_018", parentId: "cat_017", tierId: "tier_2", cultureType: "Marwadi", nodeType: "sub_type", name: "Mayra", slug: "marwadi-mayra", description: "Marwadi pre-wedding ritual block.", displayOrder: 1 }
  ],
  rituals: [
    {
      id: "ritual_001",
      name: "Lakshmi Puja",
      tierId: "tier_1",
      cultureType: "Bengali",
      categoryId: "cat_003",
      status: "active",
      deliveryMode: "ui_and_pdf",
      pricingMode: "admin-guided",
      durationMinutes: 120,
      homepageRank: 1,
      demandLabel: "Top 8 Bengali launch ritual",
      pricing: { dakshinaAmount: 2200, samagriAddOns: 350, zoneWiseTravelFee: 150, peakMultiplier: 1.15 },
      fardTemplate: { items: [{ label: "Ghot", quantity: "1" }, { label: "Mango leaves", quantity: "5" }, { label: "Flowers", quantity: "As required" }] }
    },
    {
      id: "ritual_002",
      name: "Gaye Holud",
      tierId: "tier_2",
      cultureType: "Bengali",
      categoryId: "cat_006",
      status: "active",
      deliveryMode: "ui_and_pdf",
      pricingMode: "hybrid",
      durationMinutes: 180,
      homepageRank: 2,
      demandLabel: "Top 8 Bengali launch ritual",
      pricing: { dakshinaAmount: 8500, samagriAddOns: 2200, zoneWiseTravelFee: 300, peakMultiplier: 1.2 },
      fardTemplate: { items: [{ label: "Haldi tray", quantity: "1" }, { label: "Flowers", quantity: "Bulk" }, { label: "Mangal dravya", quantity: "1 set" }] }
    },
    {
      id: "ritual_003",
      name: "Chhath Puja",
      tierId: "tier_3",
      cultureType: "North_Indian",
      categoryId: "cat_009",
      status: "draft",
      deliveryMode: "ui_only",
      pricingMode: "admin-guided",
      durationMinutes: 240,
      homepageRank: 1,
      demandLabel: "North Indian seeded ritual",
      pricing: { dakshinaAmount: 3200, samagriAddOns: 700, zoneWiseTravelFee: 250, peakMultiplier: 1.35 },
      fardTemplate: { items: [{ label: "Soop", quantity: "2" }, { label: "Fruits", quantity: "Bulk" }, { label: "Arghya setup", quantity: "1" }] }
    },
    {
      id: "ritual_004",
      name: "Hastagranthi",
      tierId: "tier_2",
      cultureType: "Odia",
      categoryId: "cat_012",
      status: "draft",
      deliveryMode: "ui_and_pdf",
      pricingMode: "hybrid",
      durationMinutes: 180,
      homepageRank: 1,
      demandLabel: "Odia seeded ritual",
      pricing: { dakshinaAmount: 7600, samagriAddOns: 2100, zoneWiseTravelFee: 280, peakMultiplier: 1.1 },
      fardTemplate: { items: [{ label: "Marriage samagri", quantity: "1 set" }, { label: "Hastagranthi thread", quantity: "1" }] }
    }
  ],
  panjikaResearch: [
    { cultureType: "Bengali", sources: ["Gupta Press", "Bishuddha Siddhanta"], adminInstruction: "Select Bengali before pasting raw Panjika text so tithi and shubha muhurta are parsed in Bengali tradition context.", sampleRituals: ["Gaye Holud", "Bou Bhat", "Annaprashan"] },
    { cultureType: "North_Indian", sources: ["Thakur Prasad", "Vikram Samvat"], adminInstruction: "Use North Indian context for Panchang parsing before publishing muhurta guidance.", sampleRituals: ["Chhath Puja", "Satyanarayan Katha", "Sindoor Daan"] },
    { cultureType: "Marwadi", sources: ["Marwari Panchang"], adminInstruction: "Use Marwadi Panchang context for event timing and marriage ritual naming.", sampleRituals: ["Mayra", "Bhaat", "Phera Styles"] },
    { cultureType: "Odia", sources: ["Kohinoor", "Bhagyadaya Panjika"], adminInstruction: "Select Odia before parsing Kohinoor or Bhagyadaya text.", sampleRituals: ["Boita Bandana", "Sankranti", "Hastagranthi"] },
    { cultureType: "Gujarati", sources: ["Janmabhoomi", "Gujarati Panchang"], adminInstruction: "Select Gujarati before parsing Janmabhoomi calendar text.", sampleRituals: ["Vastu Shanti", "Mangal Phera", "Garba Pujan"] }
  ]
};

async function ensureDirectory() {
  await mkdir(path.dirname(ritualFilePath), { recursive: true });
}

async function writeStore(store: RitualStore) {
  await ensureDirectory();
  await writeFile(ritualFilePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function normalizeStore(parsed: Partial<RitualStore>): RitualStore {
  return {
    fardRules: parsed.fardRules ?? fallbackStore.fardRules,
    tiers: parsed.tiers ?? fallbackStore.tiers,
    categories: (parsed.categories ?? fallbackStore.categories).map((category, index) => ({
      ...fallbackStore.categories[index % fallbackStore.categories.length],
      ...category,
      cultureType: category.cultureType ?? "Bengali",
      nodeType: category.nodeType ?? (category.parentId ? "sub_type" : "tradition")
    })),
    rituals: (parsed.rituals ?? fallbackStore.rituals).map((ritual, index) => ({
      ...fallbackStore.rituals[index % fallbackStore.rituals.length],
      ...ritual,
      cultureType: ritual.cultureType ?? fallbackStore.rituals[index % fallbackStore.rituals.length].cultureType,
      durationMinutes: ritual.durationMinutes ?? 120,
      homepageRank: ritual.homepageRank ?? null,
      demandLabel: ritual.demandLabel ?? "Seeded ritual",
      pricing: ritual.pricing ?? fallbackStore.rituals[index % fallbackStore.rituals.length].pricing
    })),
    panjikaResearch: parsed.panjikaResearch ?? fallbackStore.panjikaResearch
  };
}

export async function getRitualStore() {
  try {
    const raw = await readFile(ritualFilePath, "utf8");
    return normalizeStore(JSON.parse(raw) as Partial<RitualStore>);
  } catch {
    await writeStore(fallbackStore);
    return fallbackStore;
  }
}

export async function updateTier(input: RitualTier) {
  const current = await getRitualStore();
  const next: RitualStore = { ...current, tiers: current.tiers.map((tier) => (tier.id === input.id ? input : tier)) };
  await writeStore(next);
  return next;
}

export async function updateCategory(input: RitualCategory) {
  const current = await getRitualStore();
  const next: RitualStore = {
    ...current,
    categories: current.categories.map((category) => (category.id === input.id ? input : category)),
    rituals: current.rituals.map((ritual) => (ritual.categoryId === input.id ? { ...ritual, tierId: input.tierId, cultureType: input.cultureType } : ritual))
  };
  await writeStore(next);
  return next;
}

export async function addCategory(input: Omit<RitualCategory, "id">) {
  const current = await getRitualStore();
  const nextId = `cat_${String(current.categories.length + 1).padStart(3, "0")}`;
  const next: RitualStore = { ...current, categories: [...current.categories, { id: nextId, ...input }] };
  await writeStore(next);
  return next;
}

export async function removeCategory(id: string) {
  const current = await getRitualStore();
  const next: RitualStore = {
    ...current,
    categories: current.categories.filter((category) => category.id !== id)
  };
  await writeStore(next);
  return next;
}

export async function updateRitual(input: RitualRecord) {
  const current = await getRitualStore();
  const next: RitualStore = { ...current, rituals: current.rituals.map((ritual) => (ritual.id === input.id ? input : ritual)) };
  await writeStore(next);
  return next;
}

export async function addRitual(input: Omit<RitualRecord, "id">) {
  const current = await getRitualStore();
  const nextId = `ritual_${String(current.rituals.length + 1).padStart(3, "0")}`;
  const next: RitualStore = { ...current, rituals: [...current.rituals, { id: nextId, ...input }] };
  await writeStore(next);
  return next;
}

export async function removeRitual(id: string) {
  const current = await getRitualStore();
  const next: RitualStore = {
    ...current,
    rituals: current.rituals.filter((ritual) => ritual.id !== id)
  };
  await writeStore(next);
  return next;
}

export async function updatePanjikaResearch(input: PanjikaResearch) {
  const current = await getRitualStore();
  const exists = current.panjikaResearch.some((entry) => entry.cultureType === input.cultureType);
  const next: RitualStore = {
    ...current,
    panjikaResearch: exists
      ? current.panjikaResearch.map((entry) => (entry.cultureType === input.cultureType ? input : entry))
      : [...current.panjikaResearch, input]
  };
  await writeStore(next);
  return next;
}

export async function removePanjikaResearch(cultureType: CultureType) {
  const current = await getRitualStore();
  const next: RitualStore = {
    ...current,
    panjikaResearch: current.panjikaResearch.filter((entry) => entry.cultureType !== cultureType)
  };
  await writeStore(next);
  return next;
}

export async function addFardRule(rule: string) {
  const current = await getRitualStore();
  const next: RitualStore = {
    ...current,
    fardRules: [...current.fardRules, rule]
  };
  await writeStore(next);
  return next;
}

export async function updateFardRule(index: number, rule: string) {
  const current = await getRitualStore();
  const nextRules = [...current.fardRules];

  if (index < 0 || index >= nextRules.length) {
    return current;
  }

  nextRules[index] = rule;

  const next: RitualStore = {
    ...current,
    fardRules: nextRules
  };
  await writeStore(next);
  return next;
}

export async function removeFardRule(index: number) {
  const current = await getRitualStore();
  const next: RitualStore = {
    ...current,
    fardRules: current.fardRules.filter((_, ruleIndex) => ruleIndex !== index)
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
  return categories.filter((category) => category.parentId === parentId).sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
}

export function getLeafCategoryOptions(categories: RitualCategory[]) {
  const parentIds = new Set(categories.filter((category) => category.parentId).map((category) => category.parentId));
  return categories
    .filter((category) => !parentIds.has(category.id))
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name))
    .map((category) => ({ value: category.id, label: `${category.cultureType}: ${buildCategoryLabel(category.id, categories)}` }));
}

export function getCategoriesByCulture(categories: RitualCategory[]) {
  return categories.reduce<Record<CultureType, RitualCategory[]>>(
    (acc, category) => {
      acc[category.cultureType].push(category);
      return acc;
    },
    { Bengali: [], North_Indian: [], Marwadi: [], Odia: [], Gujarati: [] }
  );
}

export function getTopDemandRituals(store: RitualStore) {
  return store.rituals
    .filter((ritual) => ritual.homepageRank !== null)
    .sort((a, b) => (a.homepageRank ?? 99) - (b.homepageRank ?? 99));
}

export function getRitualMetrics(store: RitualStore) {
  return {
    serviceTiers: store.tiers.length,
    categoryCount: store.categories.length,
    ritualCount: store.rituals.length,
    fardTemplates: store.rituals.filter((ritual) => getFardItemCount(ritual.fardTemplate) > 0).length,
    culturesCovered: new Set(store.categories.map((category) => category.cultureType)).size
  };
}
