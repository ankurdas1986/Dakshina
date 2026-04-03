import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SettingsSnapshot } from "./settings";

export type AdminNotificationType =
  | "priest_registration"
  | "user_registration"
  | "booking"
  | "kyc"
  | "referral";

export type AdminNotification = {
  id: string;
  type: AdminNotificationType;
  title: string;
  detail: string;
  href: string;
  createdAt: string;
  read: boolean;
};

type NotificationStore = {
  notifications: AdminNotification[];
};

const notificationFilePath = path.join(process.cwd(), "data", "notifications.json");

const fallbackStore: NotificationStore = {
  notifications: [
    {
      id: "notif_001",
      type: "priest_registration",
      title: "New priest registration submitted",
      detail: "Pandit Arindam Bhattacharya submitted a new priest account and is waiting for KYC review.",
      href: "/dashboard/priests/priest_001",
      createdAt: "2026-04-03 14:20",
      read: false
    },
    {
      id: "notif_002",
      type: "user_registration",
      title: "New devotee account created",
      detail: "Sourav Banerjee completed a new user registration from Bally, Howrah.",
      href: "/dashboard",
      createdAt: "2026-04-03 13:50",
      read: false
    },
    {
      id: "notif_003",
      type: "kyc",
      title: "KYC review requires attention",
      detail: "Pandit Subhajit Chakraborty uploaded service specialization proof and needs admin review.",
      href: "/dashboard/priests/priest_002",
      createdAt: "2026-04-03 12:15",
      read: true
    },
    {
      id: "notif_004",
      type: "booking",
      title: "Booking replacement in progress",
      detail: "DK-1051 needs reassignment before contact reveal can be unblocked.",
      href: "/dashboard/bookings/booking_003",
      createdAt: "2026-04-03 11:40",
      read: true
    }
  ]
};

async function ensureDirectory() {
  await mkdir(path.dirname(notificationFilePath), { recursive: true });
}

async function writeStore(store: NotificationStore) {
  await ensureDirectory();
  await writeFile(notificationFilePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function getNotificationStore() {
  try {
    const raw = await readFile(notificationFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<NotificationStore>;
    return {
      notifications: parsed.notifications ?? fallbackStore.notifications
    };
  } catch {
    await writeStore(fallbackStore);
    return fallbackStore;
  }
}

function isNotificationEnabled(
  type: AdminNotificationType,
  settings: SettingsSnapshot["notificationSettings"]
) {
  if (!settings.adminInboxEnabled) {
    return false;
  }

  if (type === "priest_registration" || type === "user_registration") {
    return settings.registrationAlertsEnabled;
  }

  if (type === "booking") {
    return settings.bookingAlertsEnabled;
  }

  if (type === "kyc") {
    return settings.kycAlertsEnabled;
  }

  if (type === "referral") {
    return settings.referralAlertsEnabled;
  }

  return true;
}

export async function getAdminNotificationInbox(settings: SettingsSnapshot["notificationSettings"]) {
  const store = await getNotificationStore();
  const notifications = store.notifications.filter((item) => isNotificationEnabled(item.type, settings));
  const unreadCount = notifications.filter((item) => !item.read).length;

  return {
    notifications,
    unreadCount
  };
}
