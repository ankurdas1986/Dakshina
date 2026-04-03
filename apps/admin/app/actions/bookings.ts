"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  type AdvanceState,
  type BookingRisk,
  type BookingStatus,
  getBookingStore,
  updateBookingCase
} from "../../lib/booking-store";

function normalizeText(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function redirectSuccess(message: string) {
  revalidatePath("/dashboard/bookings");
  redirect(`/dashboard/bookings?message=${message}`);
}

export async function saveBookingCase(formData: FormData) {
  const id = normalizeText(formData.get("id"));

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
    replacementNotes: normalizeText(formData.get("replacementNotes"), booking.replacementNotes)
  });

  redirectSuccess("booking_saved");
}
