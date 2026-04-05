"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getPriestStore,
  type PriestKycStatus,
  type PriestLanguage,
  type PriestVerificationStatus,
  updatePriestReview
} from "../../lib/priest-store";
import { getRitualStore } from "../../lib/ritual-store";
import type { CultureType } from "../../lib/settings";

function normalizeText(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeNumber(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseList(value: FormDataEntryValue | null) {
  return normalizeText(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function savePriestReview(formData: FormData) {
  const id = normalizeText(formData.get("id"));
  const returnTo = normalizeText(formData.get("returnTo"), "/dashboard/priests");

  if (!id) {
    redirect("/dashboard/priests?error=missing_priest_id");
  }

  const currentPriestStore = await getPriestStore();
  const currentPriest = currentPriestStore.priests.find((item) => item.id === id);

  if (!currentPriest) {
    redirect("/dashboard/priests?error=invalid_priest_id");
  }

  const currentRitualStore = await getRitualStore();
  const ritualIds = parseList(formData.get("ritualIds"));
  const mainCategoryId = normalizeText(formData.get("mainCategoryId")) || null;
  const serviceCategoryId = normalizeText(formData.get("serviceCategoryId")) || null;
  const services = currentRitualStore.rituals.filter((ritual) => ritualIds.includes(ritual.id)).map((ritual) => ritual.name);

  await updatePriestReview({
    id,
    kycStatus: normalizeText(formData.get("kycStatus"), "pending") as PriestKycStatus,
    verificationStatus: normalizeText(formData.get("verificationStatus"), "unverified") as PriestVerificationStatus,
    radiusKm: normalizeNumber(formData.get("radiusKm"), 0),
    pendingPayout: normalizeNumber(formData.get("pendingPayout"), currentPriest.pendingPayout),
    notes: normalizeText(formData.get("notes"), currentPriest.notes),
    mainCategoryId,
    serviceCategoryId,
    ritualIds,
    services,
    cultureTags: parseList(formData.get("cultureTags")) as CultureType[],
    languageTags: parseList(formData.get("languageTags")) as PriestLanguage[],
    availabilitySummary: normalizeText(formData.get("availabilitySummary"), currentPriest.availabilitySummary)
  });

  revalidatePath("/dashboard/priests");
  revalidatePath(`/dashboard/priests/${id}`);
  redirect(`${returnTo}?message=priest_review_saved` as never);
}
