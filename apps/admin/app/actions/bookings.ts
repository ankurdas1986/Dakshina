"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  type AdvanceState,
  type BookingRisk,
  type BookingStatus,
  type CompletionOtpStatus,
  getBookingStore,
  updateBookingCase
} from "../../lib/booking-store";

function normalizeText(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeNumber(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function saveBookingCase(formData: FormData) {
  const id = normalizeText(formData.get("id"));
  const returnTo = normalizeText(formData.get("returnTo"), "/dashboard/bookings");

  if (!id) {
    redirect("/dashboard/bookings?error=missing_booking_id");
  }

  const current = await getBookingStore();
  const booking = current.cases.find((item) => item.id === id);

  if (!booking) {
    redirect("/dashboard/bookings?error=invalid_booking_id");
  }

  await updateBookingCase({
    ...booking,
    assignedPriest: normalizeText(formData.get("assignedPriest"), booking.assignedPriest),
    status: normalizeText(formData.get("status"), booking.status) as BookingStatus,
    advanceState: normalizeText(formData.get("advanceState"), booking.advanceState) as AdvanceState,
    contactReveal: normalizeText(formData.get("contactReveal"), booking.contactReveal),
    risk: normalizeText(formData.get("risk"), booking.risk) as BookingRisk,
    replacementRequired: formData.get("replacementRequired") === "on",
    replacementNotes: normalizeText(formData.get("replacementNotes"), booking.replacementNotes),
    completionOtpStatus: normalizeText(formData.get("completionOtpStatus"), booking.completionOtpStatus) as CompletionOtpStatus,
    completionOtpIssuedAt: normalizeText(formData.get("completionOtpIssuedAt"), booking.completionOtpIssuedAt),
    completionOtpVerifiedAt: normalizeText(formData.get("completionOtpVerifiedAt"), booking.completionOtpVerifiedAt),
    completionOtpAttempts: normalizeNumber(formData.get("completionOtpAttempts"), booking.completionOtpAttempts),
    completionOtpLastEvent: normalizeText(formData.get("completionOtpLastEvent"), booking.completionOtpLastEvent),
    governance: {
      minBookingGapHours: normalizeNumber(formData.get("minBookingGapHours"), booking.governance.minBookingGapHours),
      maxBookingWindowDays: normalizeNumber(formData.get("maxBookingWindowDays"), booking.governance.maxBookingWindowDays),
      forcedBookingOverride: formData.get("forcedBookingOverride") === "on",
      whatsappConfirmationState: normalizeText(formData.get("whatsappConfirmationState"), booking.governance.whatsappConfirmationState) as typeof booking.governance.whatsappConfirmationState
    },
    pricing: {
      dakshinaAmount: normalizeNumber(formData.get("dakshinaAmount"), booking.pricing.dakshinaAmount),
      samagriAddOns: normalizeNumber(formData.get("samagriAddOns"), booking.pricing.samagriAddOns),
      zoneWiseTravelFee: normalizeNumber(formData.get("zoneWiseTravelFee"), booking.pricing.zoneWiseTravelFee),
      peakMultiplier: normalizeNumber(formData.get("peakMultiplier"), booking.pricing.peakMultiplier)
    }
  });

  revalidatePath("/dashboard/bookings");
  revalidatePath(`/dashboard/bookings/${id}`);
  redirect(`${returnTo}?message=booking_saved` as never);
}
