"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPayoutStore, type PayoutStatus, updatePayoutEntry } from "../../lib/payout-store";

function normalizeText(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeNumber(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function savePayoutEntry(formData: FormData) {
  const id = normalizeText(formData.get("id"));
  const returnTo = normalizeText(formData.get("returnTo"), "/dashboard/payouts");

  if (!id) {
    redirect("/dashboard/payouts?error=missing_payout_id");
  }

  const current = await getPayoutStore();
  const payout = current.entries.find((entry) => entry.id === id);

  if (!payout) {
    redirect("/dashboard/payouts?error=invalid_payout_id");
  }

  await updatePayoutEntry({
    ...payout,
    payoutAmount: normalizeNumber(formData.get("payoutAmount"), payout.payoutAmount),
    status: normalizeText(formData.get("status"), payout.status) as PayoutStatus,
    payoutReference: normalizeText(formData.get("payoutReference"), payout.payoutReference),
    payoutScheduledFor: normalizeText(formData.get("payoutScheduledFor"), payout.payoutScheduledFor),
    payoutNotes: normalizeText(formData.get("payoutNotes"), payout.payoutNotes),
    payoutDetails: {
      upiId: normalizeText(formData.get("upiId"), payout.payoutDetails.upiId),
      accountHolder: normalizeText(
        formData.get("accountHolder"),
        payout.payoutDetails.accountHolder
      )
    }
  });

  revalidatePath("/dashboard/payouts");
  revalidatePath(`/dashboard/payouts/${id}`);
  redirect(`${returnTo}?message=payout_saved` as never);
}
