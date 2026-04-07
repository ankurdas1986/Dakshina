"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getSettingsSnapshot,
  parseControlFormData,
  parseDistrictFormData,
  parseNotificationFormData,
  parsePlatformFormData,
  updateControlSettings,
  updateDistrictSettings,
  updateNotificationSettings,
  updatePlatformSettings
} from "../../lib/settings-store";

function normalizeReturnTo(formData: FormData, fallback: string) {
  const raw = formData.get("returnTo");
  if (typeof raw !== "string" || !raw.startsWith("/dashboard/settings")) {
    return fallback;
  }

  return raw;
}

export async function savePlatformSettings(formData: FormData) {
  const current = await getSettingsSnapshot();
  const next = parsePlatformFormData(formData, current);
  await updatePlatformSettings(next);
  revalidatePath("/dashboard");
  redirect(`${normalizeReturnTo(formData, "/dashboard/settings/culture")}?message=platform_settings_saved` as never);
}

export async function saveDistrictSettings(formData: FormData) {
  const current = await getSettingsSnapshot();
  const next = parseDistrictFormData(formData, current);
  await updateDistrictSettings(next);
  revalidatePath("/dashboard");
  redirect(`${normalizeReturnTo(formData, "/dashboard/settings/districts")}?message=district_settings_saved` as never);
}

export async function saveControlSettings(formData: FormData) {
  const current = await getSettingsSnapshot();
  const next = parseControlFormData(formData, current);
  await updateControlSettings(next);
  revalidatePath("/dashboard");
  redirect(`${normalizeReturnTo(formData, "/dashboard/settings/governance")}?message=policy_controls_saved` as never);
}

export async function saveNotificationSettings(formData: FormData) {
  const next = parseNotificationFormData(formData);
  await updateNotificationSettings(next);
  revalidatePath("/dashboard");
  redirect(`${normalizeReturnTo(formData, "/dashboard/settings/notifications")}?message=notification_settings_saved` as never);
}
