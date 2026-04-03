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

export async function savePlatformSettings(formData: FormData) {
  const current = await getSettingsSnapshot();
  const next = parsePlatformFormData(formData, current);
  await updatePlatformSettings(next);
  revalidatePath("/dashboard");
  redirect("/dashboard?message=platform_settings_saved");
}

export async function saveDistrictSettings(formData: FormData) {
  const current = await getSettingsSnapshot();
  const next = parseDistrictFormData(formData, current);
  await updateDistrictSettings(next);
  revalidatePath("/dashboard");
  redirect("/dashboard?message=district_settings_saved");
}

export async function saveControlSettings(formData: FormData) {
  const current = await getSettingsSnapshot();
  const next = parseControlFormData(formData, current);
  await updateControlSettings(next);
  revalidatePath("/dashboard");
  redirect("/dashboard?message=policy_controls_saved");
}

export async function saveNotificationSettings(formData: FormData) {
  const next = parseNotificationFormData(formData);
  await updateNotificationSettings(next);
  revalidatePath("/dashboard");
  redirect("/dashboard?message=notification_settings_saved");
}
