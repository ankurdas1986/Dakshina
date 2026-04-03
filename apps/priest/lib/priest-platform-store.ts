import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type PriestRecord = {
  id: string;
  name: string;
  email?: string;
  district: string;
  locality: string;
  mainCategoryId: string | null;
  serviceCategoryId: string | null;
  ritualIds: string[];
  services: string[];
  radiusKm: number;
  kycStatus: "pending" | "review" | "approved" | "rejected";
  verificationStatus: "unverified" | "review" | "verified";
  submittedAt: string;
  phone: string;
  documents: string[];
  notes: string;
};

type PriestStore = {
  requirements: string[];
  priests: PriestRecord[];
};

type AdminNotification = {
  id: string;
  type: "priest_registration" | "user_registration" | "booking" | "kyc" | "referral";
  title: string;
  detail: string;
  href: string;
  createdAt: string;
  read: boolean;
};

type NotificationStore = {
  notifications: AdminNotification[];
};

export type PriestRegistrationInput = {
  name: string;
  email: string;
  phone: string;
  district: string;
  locality: string;
  radiusKm: number;
  notes: string;
};

const sharedAdminDataPath = path.join(process.cwd(), "..", "admin", "data");
const priestFilePath = path.join(sharedAdminDataPath, "priests.json");
const notificationFilePath = path.join(sharedAdminDataPath, "notifications.json");

function nowTimestamp() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureDirectory() {
  await mkdir(sharedAdminDataPath, { recursive: true });
}

async function readJsonFile<T>(filePath: string, fallback: T) {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile(filePath: string, data: unknown) {
  await ensureDirectory();
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function getPriestRegistrationStore() {
  const fallback: PriestStore = {
    requirements: [
      "Government ID proof",
      "Address proof",
      "Recent priest profile photo",
      "Primary ritual specialization",
      "Home pin and travel radius"
    ],
    priests: []
  };

  return readJsonFile(priestFilePath, fallback);
}

export async function getPriestByEmail(email: string) {
  const store = await getPriestRegistrationStore();
  return store.priests.find((item) => (item.email ?? "").toLowerCase() === email.toLowerCase()) ?? null;
}

export async function registerPriest(input: PriestRegistrationInput) {
  const priestStore = await getPriestRegistrationStore();
  const existingPriest = priestStore.priests.find(
    (item) =>
      (item.email ?? "").toLowerCase() === input.email.toLowerCase() ||
      item.phone.trim() === input.phone.trim()
  );

  if (existingPriest) {
    return {
      ok: false as const,
      reason: "duplicate_priest"
    };
  }

  const nextId = `priest_${String(priestStore.priests.length + 1).padStart(3, "0")}`;
  const nextPriest: PriestRecord = {
    id: nextId,
    name: input.name,
    email: input.email.toLowerCase(),
    district: input.district,
    locality: input.locality,
    mainCategoryId: null,
    serviceCategoryId: null,
    ritualIds: [],
    services: [],
    radiusKm: input.radiusKm,
    kycStatus: "pending",
    verificationStatus: "unverified",
    submittedAt: new Date().toISOString().slice(0, 10),
    phone: input.phone,
    documents: [],
    notes: input.notes || "New priest registration submitted from the priest portal."
  };

  await writeJsonFile(priestFilePath, {
    ...priestStore,
    priests: [...priestStore.priests, nextPriest]
  });

  const notificationStore = await readJsonFile<NotificationStore>(notificationFilePath, {
    notifications: []
  });

  const nextNotification: AdminNotification = {
    id: `notif_${Date.now()}`,
    type: "priest_registration",
    title: "New priest registration submitted",
    detail: `${input.name} registered from ${input.locality}, ${input.district} and is waiting for KYC review.`,
    href: `/dashboard/priests/${nextId}`,
    createdAt: nowTimestamp(),
    read: false
  };

  await writeJsonFile(notificationFilePath, {
    notifications: [nextNotification, ...notificationStore.notifications]
  });

  return {
    ok: true as const,
    priest: nextPriest,
    priestSlug: slugify(input.name)
  };
}
