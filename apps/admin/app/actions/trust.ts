"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getTrustStore,
  type ReferralState,
  type ReviewState,
  type TrustControlState,
  updateReferralEntry,
  updateReviewEntry,
  updateTrustControl
} from "../../lib/trust-store";

function normalizeText(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeNumber(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function redirectSuccess(message: string) {
  revalidatePath("/dashboard/trust");
  redirect(`/dashboard/trust?message=${message}`);
}

export async function saveTrustControl(formData: FormData) {
  const id = normalizeText(formData.get("id"));

  if (!id) {
    redirect("/dashboard/trust?error=missing_control_id");
  }

  const current = await getTrustStore();
  const control = current.controls.find((item) => item.id === id);

  if (!control) {
    redirect("/dashboard/trust?error=invalid_control_id");
  }

  await updateTrustControl({
    ...control,
    title: normalizeText(formData.get("title"), control.title),
    detail: normalizeText(formData.get("detail"), control.detail),
    state: normalizeText(formData.get("state"), control.state) as TrustControlState
  });

  redirectSuccess("control_saved");
}

export async function saveReferralEntry(formData: FormData) {
  const id = normalizeText(formData.get("id"));

  if (!id) {
    redirect("/dashboard/trust?error=missing_referral_id");
  }

  const current = await getTrustStore();
  const referral = current.referrals.find((item) => item.id === id);

  if (!referral) {
    redirect("/dashboard/trust?error=invalid_referral_id");
  }

  await updateReferralEntry({
    ...referral,
    state: normalizeText(formData.get("state"), referral.state) as ReferralState,
    adminNotes: normalizeText(formData.get("adminNotes"), referral.adminNotes)
  });

  redirectSuccess("referral_saved");
}

export async function saveReviewEntry(formData: FormData) {
  const id = normalizeText(formData.get("id"));

  if (!id) {
    redirect("/dashboard/trust?error=missing_review_id");
  }

  const current = await getTrustStore();
  const review = current.reviews.find((item) => item.id === id);

  if (!review) {
    redirect("/dashboard/trust?error=invalid_review_id");
  }

  await updateReviewEntry({
    ...review,
    rating: normalizeNumber(formData.get("rating"), review.rating),
    status: normalizeText(formData.get("status"), review.status) as ReviewState,
    comment: normalizeText(formData.get("comment"), review.comment)
  });

  redirectSuccess("review_saved");
}
