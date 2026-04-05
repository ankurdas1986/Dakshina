import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CultureType } from "./settings";

export type SubscriptionEntityType = "temple" | "office" | "factory";
export type SubscriptionFrequency = "daily" | "weekly" | "monthly";
export type SubscriptionStatus = "draft" | "active" | "paused" | "completed" | "cancelled";

export type SubscriptionRecord = {
  id: string;
  entityType: SubscriptionEntityType;
  entityName: string;
  cultureType: CultureType;
  district: string;
  locality: string;
  priestId: string;
  priestName: string;
  ritual: string;
  frequency: SubscriptionFrequency;
  durationMonths: 3 | 6 | 12;
  startsOn: string;
  endsOn: string;
  nextGenerationDate: string;
  status: SubscriptionStatus;
  generatedBookingCodes: string[];
  notes: string;
};

export type SubscriptionStore = {
  subscriptions: SubscriptionRecord[];
};

const subscriptionFilePath = path.join(process.cwd(), "data", "subscriptions.json");

const fallbackStore: SubscriptionStore = {
  subscriptions: [
    {
      id: "sub_001",
      entityType: "temple",
      entityName: "Bally Kali Mandir",
      cultureType: "Bengali",
      district: "Howrah",
      locality: "Bally",
      priestId: "priest_001",
      priestName: "Pandit Arindam Bhattacharya",
      ritual: "Temple Seva Rotation",
      frequency: "daily",
      durationMonths: 3,
      startsOn: "2026-04-10",
      endsOn: "2026-07-09",
      nextGenerationDate: "2026-04-10",
      status: "active",
      generatedBookingCodes: ["SUB-DK-2001", "SUB-DK-2002", "SUB-DK-2003"],
      notes: "Daily temple opening and evening seva coverage."
    },
    {
      id: "sub_002",
      entityType: "office",
      entityName: "Howrah Trade Towers",
      cultureType: "North_Indian",
      district: "Howrah",
      locality: "Shibpur",
      priestId: "priest_002",
      priestName: "Pandit Subhajit Chakraborty",
      ritual: "Monthly office puja",
      frequency: "monthly",
      durationMonths: 6,
      startsOn: "2026-05-01",
      endsOn: "2026-10-31",
      nextGenerationDate: "2026-05-01",
      status: "draft",
      generatedBookingCodes: [],
      notes: "Monthly prosperity and inauguration cycle."
    },
    {
      id: "sub_003",
      entityType: "factory",
      entityName: "Barasat Foods Unit",
      cultureType: "Odia",
      district: "North 24 Parganas",
      locality: "Barasat",
      priestId: "priest_003",
      priestName: "Pandit Debasish Goswami",
      ritual: "Weekly sankranti maintenance",
      frequency: "weekly",
      durationMonths: 12,
      startsOn: "2026-04-12",
      endsOn: "2027-04-11",
      nextGenerationDate: "2026-04-12",
      status: "active",
      generatedBookingCodes: ["SUB-DK-3201", "SUB-DK-3202"],
      notes: "Pre-blocked weekly shift to avoid festival-month conflict."
    }
  ]
};

async function ensureDirectory() {
  await mkdir(path.dirname(subscriptionFilePath), { recursive: true });
}

async function writeStore(store: SubscriptionStore) {
  await ensureDirectory();
  await writeFile(subscriptionFilePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function getSubscriptionStore() {
  try {
    const raw = await readFile(subscriptionFilePath, "utf8");
    return JSON.parse(raw) as SubscriptionStore;
  } catch {
    await writeStore(fallbackStore);
    return fallbackStore;
  }
}

export async function updateSubscriptionRecord(input: SubscriptionRecord) {
  const current = await getSubscriptionStore();
  const next: SubscriptionStore = {
    subscriptions: current.subscriptions.map((entry) => (entry.id === input.id ? input : entry))
  };
  await writeStore(next);
  return next;
}

export function getSubscriptionMetrics(store: SubscriptionStore) {
  return {
    totalContracts: store.subscriptions.length,
    activeContracts: store.subscriptions.filter((entry) => entry.status === "active").length,
    pausedContracts: store.subscriptions.filter((entry) => entry.status === "paused").length,
    generatedBookings: store.subscriptions.reduce((total, entry) => total + entry.generatedBookingCodes.length, 0)
  };
}
