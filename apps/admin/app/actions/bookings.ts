"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  type AdvanceState,
  type BookingRisk,
  type BookingStatus,
  type CompletionOtpStatus,
  type BookingCase,
  getBookingStore,
  updateBookingCase
} from "../../lib/booking-store";
import { appendAdminNotification } from "../../lib/notification-store";

function normalizeText(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeNumber(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getAdvanceAmount(booking: BookingCase) {
  const quotedTotal =
    booking.pricing.dakshinaAmount +
    booking.pricing.samagriAddOns +
    booking.pricing.zoneWiseTravelFee;

  return booking.pricing.walletAdvanceApplied > 0
    ? booking.pricing.walletAdvanceApplied
    : Math.round((quotedTotal * booking.policySnapshot.advancePaymentPercent) / 100);
}

function calculatePendingRefundAmount(booking: BookingCase) {
  const now = new Date();
  const eventDate = new Date(`${booking.eventDate}T09:00:00+05:30`);
  const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const advanceAmount = getAdvanceAmount(booking);

  if (diffHours > 72) {
    return Math.round((advanceAmount * booking.policySnapshot.refundRules.moreThan72HoursPercent) / 100);
  }

  if (diffHours >= 24) {
    return Math.round((advanceAmount * booking.policySnapshot.refundRules.between24And72HoursPercent) / 100);
  }

  return Math.round((advanceAmount * booking.policySnapshot.refundRules.lessThan24HoursPercent) / 100);
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
      peakMultiplier: normalizeNumber(formData.get("peakMultiplier"), booking.pricing.peakMultiplier),
      walletAdvanceApplied: booking.pricing.walletAdvanceApplied
    }
  });

  revalidatePath("/dashboard/bookings");
  revalidatePath(`/dashboard/bookings/${id}`);
  redirect(`${returnTo}?message=booking_saved` as never);
}

export async function initiateBookingRefund(formData: FormData) {
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

  const refundAmount = calculatePendingRefundAmount(booking);

  await updateBookingCase({
    ...booking,
    refundState: "pending_manual",
    pendingRefundAmount: refundAmount,
    refundReason: booking.refundReason || "Admin initiated manual Razorpay refund from stored policy snapshot."
  });

  await appendAdminNotification({
    id: `notif_refund_${Date.now()}`,
    type: "refund",
    title: `Refund initiated for ${booking.bookingCode}`,
    detail: `Pending refund Rs ${refundAmount} calculated from booking policy snapshot. Process manually in Razorpay and record the reference.`,
    href: `/dashboard/bookings/${booking.id}`,
    createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    read: false
  });

  revalidatePath("/dashboard/bookings");
  revalidatePath(`/dashboard/bookings/${id}`);
  redirect(`${returnTo}?message=refund_initiated` as never);
}
