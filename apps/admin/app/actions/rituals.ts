"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addRitual,
  type DeliveryMode,
  getRitualStore,
  type PricingMode,
  type RitualStatus,
  type RitualTier,
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

  await updateRitual({
    ...ritual,
    name: normalizeText(formData.get("name"), ritual.name),
    tierId: normalizeText(formData.get("tierId"), ritual.tierId),
    status: normalizeText(formData.get("status"), ritual.status) as RitualStatus,
    deliveryMode: normalizeText(formData.get("deliveryMode"), ritual.deliveryMode) as DeliveryMode,
    pricingMode: normalizeText(formData.get("pricingMode"), ritual.pricingMode) as PricingMode,
    fardTemplate: parseFardTemplate(formData.get("fardTemplate"))
  });

  redirectSuccess("ritual_saved");
}

export async function createRitual(formData: FormData) {
  const current = await getRitualStore();
  const fallbackTierId = current.tiers[0]?.id ?? "tier_1";

  await addRitual({
    name: normalizeText(formData.get("name"), "Untitled Ritual"),
    tierId: normalizeText(formData.get("tierId"), fallbackTierId),
    status: normalizeText(formData.get("status"), "draft") as RitualStatus,
    deliveryMode: normalizeText(formData.get("deliveryMode"), "ui_and_pdf") as DeliveryMode,
    pricingMode: normalizeText(formData.get("pricingMode"), "admin-guided") as PricingMode,
    fardTemplate: parseFardTemplate(formData.get("fardTemplate"))
  });

  redirectSuccess("ritual_created");
}
