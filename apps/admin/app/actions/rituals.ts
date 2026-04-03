"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addCategory,
  addRitual,
  type DeliveryMode,
  getRitualStore,
  type PricingMode,
  type RitualCategory,
  type RitualStatus,
  type RitualTier,
  updateCategory,
  updateRitual,
  updateTier
} from "../../lib/ritual-store";

function normalizeText(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
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

  await updateRitual({
    ...ritual,
    name: normalizeText(formData.get("name"), ritual.name),
    tierId: category.tierId,
    categoryId,
    status: normalizeText(formData.get("status"), ritual.status) as RitualStatus,
    deliveryMode: normalizeText(formData.get("deliveryMode"), ritual.deliveryMode) as DeliveryMode,
    pricingMode: normalizeText(formData.get("pricingMode"), ritual.pricingMode) as PricingMode,
    fardTemplate: parseFardTemplate(formData.get("fardTemplate"))
  });

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
    categoryId,
    status: normalizeText(formData.get("status"), "draft") as RitualStatus,
    deliveryMode: normalizeText(formData.get("deliveryMode"), "ui_and_pdf") as DeliveryMode,
    pricingMode: normalizeText(formData.get("pricingMode"), "admin-guided") as PricingMode,
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
    name,
    slug: slugify(normalizeText(formData.get("slug"), name)),
    description: normalizeText(formData.get("description")),
    displayOrder: Number.parseInt(normalizeText(formData.get("displayOrder"), "1"), 10) || 1
  });

  redirectSuccess("category_created");
}
