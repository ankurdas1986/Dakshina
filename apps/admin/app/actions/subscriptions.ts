"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appendAdminNotification } from "../../lib/notification-store";
import { addBookingCases, getBookingStore, type BookingCase } from "../../lib/booking-store";
import {
  addSubscriptionRecord,
  type SubscriptionEntityType,
  type SubscriptionFrequency,
  type SubscriptionStatus,
  getSubscriptionStore,
  updateSubscriptionRecord
} from "../../lib/subscription-store";
import type { CultureType } from "../../lib/settings";

function normalizeText(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function toDateOnly(value: string) {
  return value.slice(0, 10);
}

function generateSubscriptionDates(input: { startsOn: string; endsOn: string; frequency: SubscriptionFrequency }) {
  const startsOn = toDateOnly(input.startsOn);
  const endsOn = toDateOnly(input.endsOn);
  const start = new Date(`${startsOn}T00:00:00+05:30`);
  const end = new Date(`${endsOn}T00:00:00+05:30`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return [];
  }

  const dates: string[] = [];
  const cursor = new Date(start);

  if (input.frequency === "daily") {
    while (cursor <= end && dates.length < 400) {
      dates.push(cursor.toISOString().slice(0, 10));
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  }

  if (input.frequency === "weekly") {
    while (cursor <= end && dates.length < 250) {
      dates.push(cursor.toISOString().slice(0, 10));
      cursor.setDate(cursor.getDate() + 7);
    }
    return dates;
  }

  // monthly
  const dayOfMonth = cursor.getDate();
  while (cursor <= end && dates.length < 180) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setMonth(cursor.getMonth() + 1);
    // Attempt to keep the same day-of-month; JS will roll over if invalid.
    cursor.setDate(dayOfMonth);
  }
  return dates;
}

function buildGeneratedBookingCode(subscriptionId: string, date: string) {
  return `SUB-${subscriptionId}-${date}`;
}

function normalizeDuration(value: FormDataEntryValue | null, fallback: 3 | 6 | 12) {
  const parsed = Number(value);
  return parsed === 6 || parsed === 12 ? parsed : fallback;
}

export async function saveSubscriptionRecord(formData: FormData) {
  const id = normalizeText(formData.get("id"));
  const returnTo = normalizeText(formData.get("returnTo"), "/dashboard/subscriptions");

  if (!id) {
    redirect("/dashboard/subscriptions?error=missing_subscription_id" as never);
  }

  const current = await getSubscriptionStore();
  const subscription = current.subscriptions.find((entry) => entry.id === id);

  if (!subscription) {
    redirect("/dashboard/subscriptions?error=invalid_subscription_id" as never);
  }

  const generatedBookingCodes = normalizeText(
    formData.get("generatedBookingCodes"),
    subscription.generatedBookingCodes.join(", ")
  )
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const nextStatus = normalizeText(formData.get("status"), subscription.status) as SubscriptionStatus;

  const nextSubscription = {
    ...subscription,
    entityType: normalizeText(formData.get("entityType"), subscription.entityType) as SubscriptionEntityType,
    entityName: normalizeText(formData.get("entityName"), subscription.entityName),
    cultureType: normalizeText(formData.get("cultureType"), subscription.cultureType) as CultureType,
    district: normalizeText(formData.get("district"), subscription.district),
    locality: normalizeText(formData.get("locality"), subscription.locality),
    ritual: normalizeText(formData.get("ritual"), subscription.ritual),
    frequency: normalizeText(formData.get("frequency"), subscription.frequency) as SubscriptionFrequency,
    durationMonths: normalizeDuration(formData.get("durationMonths"), subscription.durationMonths),
    startsOn: normalizeText(formData.get("startsOn"), subscription.startsOn),
    endsOn: normalizeText(formData.get("endsOn"), subscription.endsOn),
    nextGenerationDate: normalizeText(formData.get("nextGenerationDate"), subscription.nextGenerationDate),
    status: nextStatus,
    generatedBookingCodes,
    notes: normalizeText(formData.get("notes"), subscription.notes)
  };

  // If an institutional contract is activated, auto-generate booking blocks that pre-reserve priest calendars.
  let createdBlocks = 0;
  if (nextSubscription.status === "active") {
    const bookingStore = await getBookingStore();
    const existingCodes = new Set(bookingStore.cases.map((item) => item.bookingCode));
    const scheduledDates = generateSubscriptionDates({
      startsOn: nextSubscription.startsOn,
      endsOn: nextSubscription.endsOn,
      frequency: nextSubscription.frequency
    });

    const desiredCodes = scheduledDates.map((date) => buildGeneratedBookingCode(nextSubscription.id, date));
    const codeToDate = new Map(desiredCodes.map((code, index) => [code, scheduledDates[index]]));
    const missingCodes = desiredCodes.filter((code) => !existingCodes.has(code));

    if (missingCodes.length) {
      const seed = bookingStore.cases[0];
      const blocks: Array<Omit<BookingCase, "id">> = missingCodes.map((code) => {
        const date = codeToDate.get(code) ?? nextSubscription.startsOn;
        return {
          ...seed,
          bookingCode: code,
          userId: `institution_${nextSubscription.id}`,
          userName: nextSubscription.entityName,
          userPhone: "+91 00000 00000",
          cultureType: nextSubscription.cultureType,
          ritual: nextSubscription.ritual,
          district: nextSubscription.district,
          eventDate: date,
          scheduledWindow: seed.scheduledWindow,
          status: "confirmed",
          assignedPriest: nextSubscription.priestName,
          advanceState: "paid",
          contactReveal: "subscription pre-block",
          risk: "low",
          replacementRequired: false,
          replacementNotes: `Generated from institutional subscription ${nextSubscription.id}.`,
          completionOtpStatus: "not_issued",
          completionOtpIssuedAt: "",
          completionOtpVerifiedAt: "",
          completionOtpAttempts: 0,
          completionOtpLastEvent: "OTP blocked for subscription pre-block booking.",
          refundState: "not_requested",
          pendingRefundAmount: 0,
          refundReason: "",
          samagriProvider: "user",
          samagriSnapshot: [],
          pricing: {
            ...seed.pricing,
            dakshinaAmount: 0,
            samagriAddOns: 0,
            zoneWiseTravelFee: 0,
            peakMultiplier: 1,
            walletAdvanceApplied: 0
          },
          governance: {
            ...seed.governance,
            forcedBookingOverride: true,
            whatsappConfirmationState: "not_sent"
          },
          policySnapshot: {
            ...seed.policySnapshot,
            capturedAt: new Date().toISOString().slice(0, 16).replace("T", " ")
          },
          subscriptionId: nextSubscription.id,
          fardSnapshotLockedAt: "",
          fardSnapshot: seed.fardSnapshot
        };
      });

      await addBookingCases(blocks);
      createdBlocks = blocks.length;
    }

    nextSubscription.generatedBookingCodes = Array.from(
      new Set([...nextSubscription.generatedBookingCodes, ...desiredCodes])
    );
  }

  await updateSubscriptionRecord(nextSubscription);

  await appendAdminNotification({
    id: `notif_subscription_${Date.now()}`,
    type: "subscription",
    title: `Subscription ${nextStatus}`,
    detail: `${subscription.entityName} contract updated. ${nextSubscription.generatedBookingCodes.length} generated bookings are visible${createdBlocks ? ` (created ${createdBlocks} new blocks).` : "."}`,
    href: `/dashboard/subscriptions/${subscription.id}`,
    createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    read: false
  });

  revalidatePath("/dashboard/subscriptions");
  revalidatePath(`/dashboard/subscriptions/${id}`);
  redirect(`${returnTo}?message=subscription_saved` as never);
}

export async function createSubscriptionRecord(formData: FormData) {
  const entityName = normalizeText(formData.get("entityName"), "New Contract");
  const startsOn = normalizeText(formData.get("startsOn"), new Date().toISOString().slice(0, 10));
  const durationMonths = normalizeDuration(formData.get("durationMonths"), 3);
  const endDate = new Date(startsOn);
  if (!Number.isNaN(endDate.getTime())) {
    endDate.setMonth(endDate.getMonth() + durationMonths);
    endDate.setDate(endDate.getDate() - 1);
  }

  await addSubscriptionRecord({
    entityType: normalizeText(formData.get("entityType"), "temple") as SubscriptionEntityType,
    entityName,
    cultureType: normalizeText(formData.get("cultureType"), "Bengali") as CultureType,
    district: normalizeText(formData.get("district"), "Howrah"),
    locality: normalizeText(formData.get("locality"), "Bally"),
    priestId: normalizeText(formData.get("priestId"), "priest_001"),
    priestName: normalizeText(formData.get("priestName"), "Pending assignment"),
    ritual: normalizeText(formData.get("ritual"), "Recurring ritual"),
    frequency: normalizeText(formData.get("frequency"), "monthly") as SubscriptionFrequency,
    durationMonths,
    startsOn,
    endsOn: !Number.isNaN(endDate.getTime()) ? endDate.toISOString().slice(0, 10) : startsOn,
    nextGenerationDate: startsOn,
    status: "draft",
    generatedBookingCodes: [],
    notes: normalizeText(formData.get("notes"), "Contract manually created by super admin.")
  });

  await appendAdminNotification({
    id: `notif_subscription_create_${Date.now()}`,
    type: "subscription",
    title: "Subscription created",
    detail: `${entityName} contract was created for recurring operations.`,
    href: "/dashboard/subscriptions",
    createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    read: false
  });

  revalidatePath("/dashboard/subscriptions");
  redirect("/dashboard/subscriptions?message=subscription_created" as never);
}
