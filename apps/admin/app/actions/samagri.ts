"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CultureType } from "../../lib/settings";
import {
  addMasterSamagriItem,
  removeMasterSamagriItem,
  updateMasterSamagriItem
} from "../../lib/master-samagri-store";

export async function createMasterSamagriItem(formData: FormData) {
  const cultureType = String(formData.get("cultureType") ?? "").trim() as CultureType;
  const ritualLabel = String(formData.get("ritualLabel") ?? "").trim();
  const itemName = String(formData.get("itemName") ?? "").trim();
  const localName = String(formData.get("localName") ?? "").trim();
  const unit = String(formData.get("unit") ?? "pcs").trim();
  const defaultQuantity = Number(formData.get("defaultQuantity") ?? 1);
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const isOptional = Boolean(formData.get("isOptional"));
  const isActive = formData.get("isActive") === null ? true : Boolean(formData.get("isActive"));

  if (!cultureType || !ritualLabel || !itemName) {
    redirect(`/dashboard/rituals/samagri/create?error=${encodeURIComponent("missing_fields")}` as never);
  }

  await addMasterSamagriItem({
    cultureType,
    ritualLabel,
    itemName,
    localName,
    unit,
    defaultQuantity: Number.isFinite(defaultQuantity) && defaultQuantity > 0 ? defaultQuantity : 1,
    isOptional,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    isActive
  });

  revalidatePath("/dashboard/rituals/samagri");
  redirect(`/dashboard/rituals/samagri?message=${encodeURIComponent("samagri_item_created")}` as never);
}

export async function saveMasterSamagriItem(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const cultureType = String(formData.get("cultureType") ?? "").trim() as CultureType;
  const ritualLabel = String(formData.get("ritualLabel") ?? "").trim();
  const itemName = String(formData.get("itemName") ?? "").trim();
  const localName = String(formData.get("localName") ?? "").trim();
  const unit = String(formData.get("unit") ?? "pcs").trim();
  const defaultQuantity = Number(formData.get("defaultQuantity") ?? 1);
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const isOptional = Boolean(formData.get("isOptional"));
  const isActive = Boolean(formData.get("isActive"));
  const createdAt = String(formData.get("createdAt") ?? new Date().toISOString());

  if (!id) {
    redirect(`/dashboard/rituals/samagri?error=${encodeURIComponent("missing_id")}` as never);
  }

  await updateMasterSamagriItem({
    id,
    cultureType,
    ritualLabel,
    itemName,
    localName,
    unit,
    defaultQuantity: Number.isFinite(defaultQuantity) && defaultQuantity > 0 ? defaultQuantity : 1,
    isOptional,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    isActive,
    createdAt
  });

  revalidatePath("/dashboard/rituals/samagri");
  redirect(`/dashboard/rituals/samagri?message=${encodeURIComponent("samagri_item_saved")}` as never);
}

export async function deleteMasterSamagriItem(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect(`/dashboard/rituals/samagri?error=${encodeURIComponent("missing_id")}` as never);
  }

  await removeMasterSamagriItem(id);
  revalidatePath("/dashboard/rituals/samagri");
  redirect(`/dashboard/rituals/samagri?message=${encodeURIComponent("samagri_item_deleted")}` as never);
}
