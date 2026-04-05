"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appendAdminNotification } from "../../lib/notification-store";
import { type UserAccountStatus, getUserStore, updateUserRecord } from "../../lib/user-store";

function normalizeText(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeNumber(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function saveUserRecord(formData: FormData) {
  const id = normalizeText(formData.get("id"));
  const returnTo = normalizeText(formData.get("returnTo"), "/dashboard/users");

  if (!id) {
    redirect("/dashboard/users?error=missing_user_id" as never);
  }

  const current = await getUserStore();
  const user = current.users.find((entry) => entry.id === id);

  if (!user) {
    redirect("/dashboard/users?error=invalid_user_id" as never);
  }

  const nextStatus = normalizeText(formData.get("accountStatus"), user.accountStatus) as UserAccountStatus;

  await updateUserRecord({
    ...user,
    fullName: normalizeText(formData.get("fullName"), user.fullName),
    email: normalizeText(formData.get("email"), user.email),
    phone: normalizeText(formData.get("phone"), user.phone),
    address: normalizeText(formData.get("address"), user.address),
    district: normalizeText(formData.get("district"), user.district),
    locality: normalizeText(formData.get("locality"), user.locality),
    traditionPreference: normalizeText(formData.get("traditionPreference"), user.traditionPreference) as typeof user.traditionPreference,
    walletBalance: normalizeNumber(formData.get("walletBalance"), user.walletBalance),
    accountStatus: nextStatus,
    notes: normalizeText(formData.get("notes"), user.notes)
  });

  if (nextStatus !== user.accountStatus) {
    await appendAdminNotification({
      id: `notif_user_${Date.now()}`,
      type: "user_registration",
      title: `User account ${nextStatus}`,
      detail: `${user.fullName} was moved to ${nextStatus} by super admin.`,
      href: `/dashboard/users/${user.id}`,
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      read: false
    });
  }

  revalidatePath("/dashboard/users");
  revalidatePath(`/dashboard/users/${id}`);
  redirect(`${returnTo}?message=user_saved` as never);
}
