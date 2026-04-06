"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addBookingCase,
  type AdvanceState,
  type BookingRisk,
  type BookingStatus,
  type CompletionOtpStatus,
  type BookingCase,
  getBookingStore,
  updateBookingCase
} from "../../lib/booking-store";
import { appendAdminNotification } from "../../lib/notification-store";
import type { CultureType } from "../../lib/settings";

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

export async function createBookingCase(formData: FormData) {
  const current = await getBookingStore();
  const seed = current.cases[0];
  const eventDate = normalizeText(formData.get("eventDate"), new Date().toISOString().slice(0, 10));
  const ritual = normalizeText(formData.get("ritual"), "Manual booking");
  const userName = normalizeText(formData.get("userName"), "Manual user");
  const bookingCode = normalizeText(
    formData.get("bookingCode"),
    `DK-${1000 + current.cases.length + 1}`
  );

  await addBookingCase({
    bookingCode,
    userId: normalizeText(formData.get("userId"), `manual_user_${Date.now()}`),
    userName,
    userPhone: normalizeText(formData.get("userPhone"), "+91 90000 00000"),
    cultureType: normalizeText(formData.get("cultureType"), "Bengali") as CultureType,
    ritual,
    district: normalizeText(formData.get("district"), "Howrah"),
    eventDate,
    scheduledWindow: normalizeText(formData.get("scheduledWindow"), "09:00 AM - 11:00 AM"),
    status: "draft",
    assignedPriest: normalizeText(formData.get("assignedPriest"), "Pending assignment"),
    advanceState: "pending" as AdvanceState,
    contactReveal: "payment required",
    risk: normalizeText(formData.get("risk"), "medium") as BookingRisk,
    replacementRequired: false,
    replacementNotes: "Manual admin booking created.",
    completionOtpStatus: "not_issued" as CompletionOtpStatus,
    completionOtpIssuedAt: "",
    completionOtpVerifiedAt: "",
    completionOtpAttempts: 0,
    completionOtpLastEvent: "OTP blocked until advance confirmation.",
    refundState: "not_requested",
    pendingRefundAmount: 0,
    refundReason: "",
    pricing: {
      dakshinaAmount: normalizeNumber(formData.get("dakshinaAmount"), seed.pricing.dakshinaAmount),
      samagriAddOns: normalizeNumber(formData.get("samagriAddOns"), 0),
      zoneWiseTravelFee: normalizeNumber(formData.get("zoneWiseTravelFee"), 0),
      peakMultiplier: normalizeNumber(formData.get("peakMultiplier"), 1),
      walletAdvanceApplied: 0
    },
    governance: {
      minBookingGapHours: normalizeNumber(formData.get("minBookingGapHours"), seed.governance.minBookingGapHours),
      maxBookingWindowDays: normalizeNumber(formData.get("maxBookingWindowDays"), seed.governance.maxBookingWindowDays),
      forcedBookingOverride: formData.get("forcedBookingOverride") === "on",
      whatsappConfirmationState: "not_sent"
    },
    policySnapshot: {
      capturedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      refundRules: { ...seed.policySnapshot.refundRules },
      advancePaymentPercent: seed.policySnapshot.advancePaymentPercent,
      manualRazorpayRefund: true
    },
    fardSnapshotLockedAt: "",
    fardSnapshot: {
      deliveryMode: "ui_only",
      items: [{ label: "To be attached after ritual confirmation", quantity: "Pending" }]
    }
  });

  await appendAdminNotification({
    id: `notif_booking_create_${Date.now()}`,
    type: "booking",
    title: `Manual booking created`,
    detail: `${bookingCode} for ${ritual} was created from the super-admin console.`,
    href: "/dashboard/bookings",
    createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    read: false
  });

  revalidatePath("/dashboard/bookings");
  redirect("/dashboard/bookings?message=booking_created" as never);
}
