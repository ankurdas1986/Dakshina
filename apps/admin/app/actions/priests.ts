"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  type PriestKycStatus,
  type PriestVerificationStatus,
  updatePriestReview
} from "../../lib/priest-store";

function normalizeText(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeNumber(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function savePriestReview(formData: FormData) {
  const id = normalizeText(formData.get("id"));

  if (!id) {
    redirect("/dashboard/priests?error=missing_priest_id");
  }

  await updatePriestReview({
    id,
    kycStatus: normalizeText(formData.get("kycStatus"), "pending") as PriestKycStatus,
    verificationStatus: normalizeText(
      formData.get("verificationStatus"),
      "unverified"
    ) as PriestVerificationStatus,
    radiusKm: normalizeNumber(formData.get("radiusKm"), 0),
    notes: normalizeText(formData.get("notes"))
  });

  revalidatePath("/dashboard/priests");
  redirect("/dashboard/priests?message=priest_review_saved");
}
