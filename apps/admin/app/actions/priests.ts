"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addPriestRecord,
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

export async function createPriestRecord(formData: FormData) {
  const currentRitualStore = await getRitualStore();
  const mainCategoryId = normalizeText(formData.get("mainCategoryId")) || null;
  const serviceCategoryId = normalizeText(formData.get("serviceCategoryId")) || null;
  const ritualIds = parseList(formData.get("ritualIds"));
  const services = currentRitualStore.rituals.filter((ritual) => ritualIds.includes(ritual.id)).map((ritual) => ritual.name);
  const name = normalizeText(formData.get("name"), "New Priest");
  const email = normalizeText(formData.get("email"), `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@dakshina.local`);

  await addPriestRecord({
    name,
    email,
    district: normalizeText(formData.get("district"), "Howrah"),
    locality: normalizeText(formData.get("locality"), "Bally"),
    mainCategoryId,
    serviceCategoryId,
    ritualIds,
    services,
    cultureTags: parseList(formData.get("cultureTags")) as CultureType[],
    languageTags: parseList(formData.get("languageTags")) as PriestLanguage[],
    radiusKm: normalizeNumber(formData.get("radiusKm"), 10),
    availabilitySummary: normalizeText(formData.get("availabilitySummary"), "Availability pending review."),
    kycStatus: "pending",
    verificationStatus: "unverified",
    submittedAt: new Date().toISOString().slice(0, 10),
    phone: normalizeText(formData.get("phone"), "+91 90000 00000"),
    pendingPayout: 0,
    documents: ["aadhaar", "profile_photo"],
    documentRecords: [
      { id: `doc_${Date.now()}`, type: "aadhaar", side: "front", status: "pending" },
      { id: `doc_${Date.now() + 1}`, type: "profile_photo", side: "single", status: "pending" }
    ],
    notes: normalizeText(formData.get("notes"), "Manually added by super admin.")
  });

  revalidatePath("/dashboard/priests");
  redirect("/dashboard/priests?message=priest_created" as never);
}
