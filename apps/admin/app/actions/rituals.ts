"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addCategory,
  addRitual,
  type CategoryNodeType,
  type DeliveryMode,
  getRitualStore,
  type PricingMode,
  type RitualCategory,
  type RitualRecord,
  type RitualStatus,
  type RitualTier,
  updateCategory,
  updateRitual,
  removeCategory,
  removeRitual,
  updateTier
} from "../../lib/ritual-store";
import type { CultureType } from "../../lib/settings";

function normalizeText(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeNumber(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCulture(value: FormDataEntryValue | null, fallback: CultureType): CultureType {
  const next = normalizeText(value, fallback);
  return ["Bengali", "North_Indian", "Marwadi", "Odia", "Gujarati"].includes(next)
    ? (next as CultureType)
    : fallback;
}

function parseFardTemplate(value: FormDataEntryValue | null) {
  const text = normalizeText(value, "{}");

  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;

    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      throw new Error("Fard template must be a JSON object.");
    }

    return parsed;
  } catch {
    redirect("/dashboard/rituals?error=invalid_fard_json");
  }
}

function redirectSuccess(message: string) {
  revalidatePath("/dashboard/rituals");
  redirect(`/dashboard/rituals?message=${message}`);
}

export async function saveTier(formData: FormData) {
  const id = normalizeText(formData.get("id"));

  if (!id) {
    redirect("/dashboard/rituals?error=missing_tier_id");
  }

  const current = await getRitualStore();
  const tier = current.tiers.find((item) => item.id === id);

  if (!tier) {
    redirect("/dashboard/rituals?error=invalid_tier_id");
  }

  const nextTier: RitualTier = {
    ...tier,
    title: normalizeText(formData.get("title"), tier.title),
    focus: normalizeText(formData.get("focus"), tier.focus),
    status: normalizeText(formData.get("status"), tier.status) === "active" ? "active" : "planned",
    pricingMode: normalizeText(formData.get("pricingMode"), tier.pricingMode) as PricingMode
  };

  await updateTier(nextTier);
  redirectSuccess("tier_saved");
}

export async function saveRitual(formData: FormData) {
  const id = normalizeText(formData.get("id"));

  if (!id) {
    redirect("/dashboard/rituals?error=missing_ritual_id");
  }

  const current = await getRitualStore();
  const ritual = current.rituals.find((item) => item.id === id);

  if (!ritual) {
    redirect("/dashboard/rituals?error=invalid_ritual_id");
  }

  const categoryId = normalizeText(formData.get("categoryId"), ritual.categoryId);
  const category = current.categories.find((item) => item.id === categoryId);

  if (!category) {
    redirect("/dashboard/rituals?error=invalid_category_id");
  }

  const nextRitual: RitualRecord = {
    ...ritual,
    name: normalizeText(formData.get("name"), ritual.name),
    tierId: category.tierId,
    cultureType: normalizeCulture(formData.get("cultureType"), category.cultureType),
    categoryId,
    status: normalizeText(formData.get("status"), ritual.status) as RitualStatus,
    deliveryMode: normalizeText(formData.get("deliveryMode"), ritual.deliveryMode) as DeliveryMode,
    pricingMode: normalizeText(formData.get("pricingMode"), ritual.pricingMode) as PricingMode,
    durationMinutes: normalizeNumber(formData.get("durationMinutes"), ritual.durationMinutes),
    homepageRank: normalizeText(formData.get("homepageRank")) ? normalizeNumber(formData.get("homepageRank"), ritual.homepageRank ?? 0) : null,
    demandLabel: normalizeText(formData.get("demandLabel"), ritual.demandLabel),
    pricing: {
      dakshinaAmount: normalizeNumber(formData.get("dakshinaAmount"), ritual.pricing.dakshinaAmount),
      samagriAddOns: normalizeNumber(formData.get("samagriAddOns"), ritual.pricing.samagriAddOns),
      zoneWiseTravelFee: normalizeNumber(formData.get("zoneWiseTravelFee"), ritual.pricing.zoneWiseTravelFee),
      peakMultiplier: normalizeNumber(formData.get("peakMultiplier"), ritual.pricing.peakMultiplier)
    },
    fardTemplate: parseFardTemplate(formData.get("fardTemplate"))
  };

  await updateRitual(nextRitual);
  redirectSuccess("ritual_saved");
}

export async function createRitual(formData: FormData) {
  const current = await getRitualStore();
  const fallbackCategoryId = current.categories[0]?.id ?? "";
  const categoryId = normalizeText(formData.get("categoryId"), fallbackCategoryId);
  const category = current.categories.find((item) => item.id === categoryId);

  if (!category) {
    redirect("/dashboard/rituals?error=invalid_category_id");
  }

  await addRitual({
    name: normalizeText(formData.get("name"), "Untitled Ritual"),
    tierId: category.tierId,
    cultureType: normalizeCulture(formData.get("cultureType"), category.cultureType),
    categoryId,
    status: normalizeText(formData.get("status"), "draft") as RitualStatus,
    deliveryMode: normalizeText(formData.get("deliveryMode"), "ui_and_pdf") as DeliveryMode,
    pricingMode: normalizeText(formData.get("pricingMode"), "admin-guided") as PricingMode,
    durationMinutes: normalizeNumber(formData.get("durationMinutes"), 120),
    homepageRank: normalizeText(formData.get("homepageRank")) ? normalizeNumber(formData.get("homepageRank"), 1) : null,
    demandLabel: normalizeText(formData.get("demandLabel"), "Seeded ritual"),
    pricing: {
      dakshinaAmount: normalizeNumber(formData.get("dakshinaAmount"), 0),
      samagriAddOns: normalizeNumber(formData.get("samagriAddOns"), 0),
      zoneWiseTravelFee: normalizeNumber(formData.get("zoneWiseTravelFee"), 0),
      peakMultiplier: normalizeNumber(formData.get("peakMultiplier"), 1)
    },
    fardTemplate: parseFardTemplate(formData.get("fardTemplate"))
  });

  redirectSuccess("ritual_created");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function saveCategory(formData: FormData) {
  const id = normalizeText(formData.get("id"));

  if (!id) {
    redirect("/dashboard/rituals?error=missing_category_id");
  }

  const current = await getRitualStore();
  const category = current.categories.find((item) => item.id === id);

  if (!category) {
    redirect("/dashboard/rituals?error=invalid_category_id");
  }

  const parentId = normalizeText(formData.get("parentId")) || null;
  const tierId = normalizeText(formData.get("tierId"), category.tierId);
  const parent = parentId ? current.categories.find((item) => item.id === parentId) : null;

  if (parentId && !parent) {
    redirect("/dashboard/rituals?error=invalid_parent_category");
  }

  const nextCategory: RitualCategory = {
    ...category,
    parentId,
    tierId: parent?.tierId ?? tierId,
    cultureType: normalizeCulture(formData.get("cultureType"), parent?.cultureType ?? category.cultureType),
    nodeType: normalizeText(formData.get("nodeType"), category.nodeType) as CategoryNodeType,
    name: normalizeText(formData.get("name"), category.name),
    slug: slugify(normalizeText(formData.get("slug"), category.slug || category.name)),
    description: normalizeText(formData.get("description"), category.description),
    displayOrder: Number.parseInt(normalizeText(formData.get("displayOrder"), String(category.displayOrder)), 10) || category.displayOrder
  };

  await updateCategory(nextCategory);
  redirectSuccess("category_saved");
}

export async function createCategory(formData: FormData) {
  const current = await getRitualStore();
  const fallbackTierId = current.tiers[0]?.id ?? "tier_1";
  const parentId = normalizeText(formData.get("parentId")) || null;
  const parent = parentId ? current.categories.find((item) => item.id === parentId) : null;

  if (parentId && !parent) {
    redirect("/dashboard/rituals?error=invalid_parent_category");
  }

  const tierId = parent?.tierId ?? normalizeText(formData.get("tierId"), fallbackTierId);
  const name = normalizeText(formData.get("name"), "Untitled Category");

  await addCategory({
    parentId,
    tierId,
    cultureType: normalizeCulture(formData.get("cultureType"), parent?.cultureType ?? "Bengali"),
    nodeType: normalizeText(formData.get("nodeType"), parentId ? "sub_type" : "tradition") as CategoryNodeType,
    name,
    slug: slugify(normalizeText(formData.get("slug"), name)),
    description: normalizeText(formData.get("description")),
    displayOrder: Number.parseInt(normalizeText(formData.get("displayOrder"), "1"), 10) || 1
  });

  redirectSuccess("category_created");
}

export async function deleteCategory(formData: FormData) {
  const id = normalizeText(formData.get("id"));

  if (!id) {
    redirect("/dashboard/rituals?error=missing_category_id");
  }

  const current = await getRitualStore();
  const hasChildren = current.categories.some((item) => item.parentId === id);
  const hasRituals = current.rituals.some((item) => item.categoryId === id);

  if (hasChildren || hasRituals) {
    redirect("/dashboard/rituals?error=category_has_dependencies");
  }

  await removeCategory(id);
  redirectSuccess("category_deleted");
}

export async function deleteRitual(formData: FormData) {
  const id = normalizeText(formData.get("id"));

  if (!id) {
    redirect("/dashboard/rituals?error=missing_ritual_id");
  }

  await removeRitual(id);
  redirectSuccess("ritual_deleted");
}
