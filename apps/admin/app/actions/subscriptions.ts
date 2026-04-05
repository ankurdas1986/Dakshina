"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appendAdminNotification } from "../../lib/notification-store";
import {
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

  await updateSubscriptionRecord({
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
  });

  await appendAdminNotification({
    id: `notif_subscription_${Date.now()}`,
    type: "subscription",
    title: `Subscription ${nextStatus}`,
    detail: `${subscription.entityName} contract updated. ${generatedBookingCodes.length} generated bookings are visible in the contract record.`,
    href: `/dashboard/subscriptions/${subscription.id}`,
    createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    read: false
  });

  revalidatePath("/dashboard/subscriptions");
  revalidatePath(`/dashboard/subscriptions/${id}`);
  redirect(`${returnTo}?message=subscription_saved` as never);
}
