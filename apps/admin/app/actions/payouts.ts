"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPayoutStore, type PayoutStatus, updatePayoutEntry } from "../../lib/payout-store";
import { getBookingStore } from "../../lib/booking-store";
import { getPriestStore, updatePriestReview } from "../../lib/priest-store";
import { appendWalletTransaction } from "../../lib/wallet-store";
import { appendAdminNotification } from "../../lib/notification-store";

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

export async function confirmManualPayout(formData: FormData) {
  const id = normalizeText(formData.get("id"));
  const returnTo = normalizeText(formData.get("returnTo"), "/dashboard/payouts");
  const payoutReference = normalizeText(formData.get("payoutReference"));

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
    status: "paid",
    payoutReference: payoutReference || payout.payoutReference || `MANUAL-${Date.now()}`,
    payoutNotes: payout.payoutNotes || "Manual UPI payout confirmed by admin."
  });

  const priestStore = await getPriestStore();
  const priest = priestStore.priests.find((entry) => entry.id === payout.priestId);

  if (priest) {
    await updatePriestReview({
      ...priest,
      kycStatus: priest.kycStatus,
      verificationStatus: priest.verificationStatus,
      radiusKm: priest.radiusKm,
      pendingPayout: Math.max(0, priest.pendingPayout - payout.payoutAmount),
      notes: priest.notes,
      mainCategoryId: priest.mainCategoryId,
      serviceCategoryId: priest.serviceCategoryId,
      ritualIds: priest.ritualIds,
      services: priest.services,
      cultureTags: priest.cultureTags,
      languageTags: priest.languageTags,
      availabilitySummary: priest.availabilitySummary
    });
  }

  const bookingStore = await getBookingStore();
  const booking = bookingStore.cases.find((entry) => entry.id === payout.bookingId);
  const samagriCost = booking && booking.samagriProvider === "priest" ? booking.pricing.samagriAddOns : 0;

  await appendWalletTransaction({
    id: `wallet_${Date.now()}`,
    priestId: payout.priestId,
    payoutId: payout.id,
    bookingId: payout.bookingId,
    type: "priest_settlement",
    status: "completed",
    direction: "credit",
    amount: payout.payoutAmount,
    samagriCost,
    description: `Manual payout confirmed for ${payout.bookingCode}.`,
    createdAt: new Date().toISOString().slice(0, 16).replace("T", " ")
  });

  await appendAdminNotification({
    id: `notif_payout_${Date.now()}`,
    type: "wallet",
    title: `Manual payout confirmed for ${payout.bookingCode}`,
    detail: `UPI settlement recorded for ${payout.priest}. Amount Rs ${payout.payoutAmount}.`,
    href: `/dashboard/payouts/${payout.id}`,
    createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    read: false
  });

  revalidatePath("/dashboard/payouts");
  revalidatePath(`/dashboard/payouts/${id}`);
  redirect(`${returnTo}?message=payout_confirmed` as never);
}
