import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type PriestKycStatus = "pending" | "review" | "approved" | "rejected";
export type PriestVerificationStatus = "unverified" | "review" | "verified";

export type PriestRecord = {
  id: string;
  name: string;
  district: string;
  locality: string;
  mainCategoryId: string | null;
  serviceCategoryId: string | null;
  ritualIds: string[];
  services: string[];
  radiusKm: number;
  kycStatus: PriestKycStatus;
  verificationStatus: PriestVerificationStatus;
  submittedAt: string;
  phone: string;
  documents: string[];
  notes: string;
};

export type PriestStore = {
  requirements: string[];
  priests: PriestRecord[];
};

const priestFilePath = path.join(process.cwd(), "data", "priests.json");

const fallbackPriests: PriestStore = {
  requirements: [
    "Government ID proof",
    "Address proof",
    "Recent priest profile photo",
    "Primary ritual specialization",
    "Home pin and travel radius"
  ],
  priests: [
    {
      id: "priest_001",
      name: "Pandit Arindam Bhattacharya",
      district: "Howrah",
      locality: "Bally",
      mainCategoryId: "cat_001",
      serviceCategoryId: "cat_002",
      ritualIds: ["ritual_001"],
      services: ["Lakshmi Puja", "Satyanarayan Puja", "Grihoprobesh"],
      radiusKm: 14,
      kycStatus: "pending",
      verificationStatus: "unverified",
      submittedAt: "2026-04-01",
      phone: "+91 90070 10001",
      documents: ["govt_id", "address_proof", "profile_photo"],
      notes: "Strong local demand fit for Tier 1 rituals."
    },
    {
      id: "priest_002",
      name: "Pandit Subhajit Chakraborty",
      district: "Hooghly",
      locality: "Uttarpara",
      mainCategoryId: "cat_004",
      serviceCategoryId: "cat_005",
      ritualIds: ["ritual_002"],
      services: ["Wedding", "Sacred Thread", "Annaprashan"],
      radiusKm: 18,
      kycStatus: "review",
      verificationStatus: "review",
      submittedAt: "2026-03-31",
      phone: "+91 90070 10002",
      documents: ["govt_id", "address_proof", "profile_photo", "service_specialization"],
      notes: "Needs final confirmation on district travel commitment."
    },
    {
      id: "priest_003",
      name: "Pandit Debasish Goswami",
      district: "North 24 Parganas",
      locality: "Barasat",
      mainCategoryId: "cat_007",
      serviceCategoryId: "cat_008",
      ritualIds: ["ritual_003"],
      services: ["Durga Puja", "Kali Puja", "Community Events"],
      radiusKm: 22,
      kycStatus: "approved",
      verificationStatus: "verified",
      submittedAt: "2026-03-29",
      phone: "+91 90070 10003",
      documents: ["govt_id", "address_proof", "profile_photo", "service_specialization", "home_pin"],
      notes: "Suitable backup for public and barwari assignments."
    }
  ]
};

async function ensureDirectory() {
  await mkdir(path.dirname(priestFilePath), { recursive: true });
}

async function writeStore(store: PriestStore) {
  await ensureDirectory();
  await writeFile(priestFilePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function getPriestStore() {
  try {
    const raw = await readFile(priestFilePath, "utf8");
    return JSON.parse(raw) as PriestStore;
  } catch {
    await writeStore(fallbackPriests);
    return fallbackPriests;
  }
}

export async function updatePriestReview(input: {
  id: string;
  kycStatus: PriestKycStatus;
  verificationStatus: PriestVerificationStatus;
  radiusKm: number;
  notes: string;
  mainCategoryId: string | null;
  serviceCategoryId: string | null;
  ritualIds: string[];
  services: string[];
}) {
  const current = await getPriestStore();
  const priests = current.priests.map((priest) => {
    if (priest.id !== input.id) {
      return priest;
    }

    return {
      ...priest,
      kycStatus: input.kycStatus,
      verificationStatus: input.verificationStatus,
      radiusKm: input.radiusKm,
      notes: input.notes,
      mainCategoryId: input.mainCategoryId,
      serviceCategoryId: input.serviceCategoryId,
      ritualIds: input.ritualIds,
      services: input.services
    };
  });

  const next = {
    ...current,
    priests
  };

  await writeStore(next);
  return next;
}

export function getPriestMetrics(store: PriestStore) {
  const verifiedPriests = store.priests.filter((priest) => priest.verificationStatus === "verified").length;
  const pendingKyc = store.priests.filter((priest) => priest.kycStatus === "pending").length;
  const districtsCovered = new Set(store.priests.map((priest) => priest.district)).size;

  return {
    totalPriests: store.priests.length,
    verifiedPriests,
    pendingKyc,
    districtsCovered
  };
}

