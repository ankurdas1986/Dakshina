import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type PayoutStatus = "pending" | "scheduled" | "paid" | "failed";

export type PayoutEntry = {
  id: string;
  bookingCode: string;
  ritual: string;
  priest: string;
  district: string;
  completedAt: string;
  payoutAmount: number;
  status: PayoutStatus;
  payoutMethod: "manual_upi";
  payoutReference: string;
  payoutScheduledFor: string;
  payoutNotes: string;
  payoutDetails: {
    upiId: string;
    accountHolder: string;
  };
};

export type PayoutStore = {
  entries: PayoutEntry[];
};

const payoutFilePath = path.join(process.cwd(), "data", "payouts.json");

const fallbackStore: PayoutStore = {
  entries: [
    {
      id: "payout_001",
      bookingCode: "DK-1042",
      ritual: "Satyanarayan Puja",
      priest: "Pandit Arindam Bhattacharya",
      district: "Howrah",
      completedAt: "2026-04-06 09:30",
      payoutAmount: 2500,
      status: "pending",
      payoutMethod: "manual_upi",
      payoutReference: "",
      payoutScheduledFor: "2026-04-07",
      payoutNotes: "Hold until admin confirms final completion quality.",
      payoutDetails: {
        upiId: "arindam.purohit@upi",
        accountHolder: "Arindam Bhattacharya"
      }
    },
    {
      id: "payout_002",
      bookingCode: "DK-1038",
      ritual: "Wedding Ritual",
      priest: "Pandit Subhajit Chakraborty",
      district: "Hooghly",
      completedAt: "2026-04-01 22:00",
      payoutAmount: 8500,
      status: "scheduled",
      payoutMethod: "manual_upi",
      payoutReference: "",
      payoutScheduledFor: "2026-04-04",
      payoutNotes: "Manual UPI transfer queued for next settlement cycle.",
      payoutDetails: {
        upiId: "subhajit.rituals@upi",
        accountHolder: "Subhajit Chakraborty"
      }
    },
    {
      id: "payout_003",
      bookingCode: "DK-1027",
      ritual: "Lakshmi Puja",
      priest: "Pandit Debasish Goswami",
      district: "North 24 Parganas",
      completedAt: "2026-03-29 20:10",
      payoutAmount: 2100,
      status: "paid",
      payoutMethod: "manual_upi",
      payoutReference: "UPI-8246719102",
      payoutScheduledFor: "2026-03-30",
      payoutNotes: "Paid manually after OTP completion verification.",
      payoutDetails: {
        upiId: "debasish.goswami@upi",
        accountHolder: "Debasish Goswami"
      }
    }
  ]
};

async function ensureDirectory() {
  await mkdir(path.dirname(payoutFilePath), { recursive: true });
}

async function writeStore(store: PayoutStore) {
  await ensureDirectory();
  await writeFile(payoutFilePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function getPayoutStore() {
  try {
    const raw = await readFile(payoutFilePath, "utf8");
    return JSON.parse(raw) as PayoutStore;
  } catch {
    await writeStore(fallbackStore);
    return fallbackStore;
  }
}

export async function updatePayoutEntry(input: PayoutEntry) {
  const current = await getPayoutStore();
  const next: PayoutStore = {
    entries: current.entries.map((entry) => (entry.id === input.id ? input : entry))
  };
  await writeStore(next);
  return next;
}

export function getPayoutMetrics(store: PayoutStore) {
  return {
    totalEntries: store.entries.length,
    pendingCount: store.entries.filter((entry) => entry.status === "pending").length,
    scheduledCount: store.entries.filter((entry) => entry.status === "scheduled").length,
    paidCount: store.entries.filter((entry) => entry.status === "paid").length
  };
}
