import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CultureType } from "./settings";

export type PriestKycStatus = "pending" | "review" | "approved" | "rejected";
export type PriestVerificationStatus = "unverified" | "review" | "verified";
export type PriestLanguage = "Bengali" | "Hindi" | "Marwari" | "Odia" | "Gujarati" | "English" | "Sanskrit";

export type PriestDocumentRecord = {
  id: string;
  type: "aadhaar" | "voter_id" | "address_proof" | "profile_photo" | "service_specialization" | "home_pin";
  side: "front" | "back" | "single";
  status: PriestKycStatus;
};

export type PriestRecord = {
  id: string;
  name: string;
  email?: string;
  district: string;
  locality: string;
  mainCategoryId: string | null;
  serviceCategoryId: string | null;
  ritualIds: string[];
  services: string[];
  cultureTags: CultureType[];
  languageTags: PriestLanguage[];
  radiusKm: number;
  availabilitySummary: string;
  kycStatus: PriestKycStatus;
  verificationStatus: PriestVerificationStatus;
  submittedAt: string;
  phone: string;
  pendingPayout: number;
  documents: string[];
  documentRecords: PriestDocumentRecord[];
  notes: string;
};

export type PriestStore = {
  requirements: string[];
  priests: PriestRecord[];
};

const priestFilePath = path.join(process.cwd(), "data", "priests.json");

const fallbackPriests: PriestStore = {
  requirements: [
    "Aadhaar or Voter ID proof",
    "Address proof",
    "Recent priest profile photo",
    "Culture and language tags",
    "Home pin, availability, and travel radius"
  ],
  priests: [
    {
      id: "priest_001",
      name: "Pandit Arindam Bhattacharya",
      email: "arindam@dakshina.local",
      district: "Howrah",
      locality: "Bally",
      mainCategoryId: "cat_001",
      serviceCategoryId: "cat_003",
      ritualIds: ["ritual_001", "ritual_002"],
      services: ["Lakshmi Puja", "Gaye Holud"],
      cultureTags: ["Bengali"],
      languageTags: ["Bengali", "English", "Sanskrit"],
      radiusKm: 14,
      availabilitySummary: "Mon-Sun 6:00 AM - 9:00 PM, off on Amavasya afternoon",
      kycStatus: "pending",
      verificationStatus: "unverified",
      submittedAt: "2026-04-01",
      phone: "+91 90070 10001",
      pendingPayout: 2500,
      documents: ["govt_id", "address_proof", "profile_photo"],
      documentRecords: [
        { id: "doc_001", type: "aadhaar", side: "front", status: "pending" },
        { id: "doc_002", type: "aadhaar", side: "back", status: "pending" },
        { id: "doc_003", type: "profile_photo", side: "single", status: "pending" }
      ],
      notes: "Primary Bengali launch priest. Strong Tier 1 fit."
    },
    {
      id: "priest_002",
      name: "Pandit Subhajit Chakraborty",
      email: "subhajit@dakshina.local",
      district: "Hooghly",
      locality: "Uttarpara",
      mainCategoryId: "cat_004",
      serviceCategoryId: "cat_006",
      ritualIds: ["ritual_002"],
      services: ["Gaye Holud", "Bou Bhat", "Annaprashan"],
      cultureTags: ["Bengali", "North_Indian"],
      languageTags: ["Bengali", "Hindi", "English"],
      radiusKm: 18,
      availabilitySummary: "Tue-Sun 7:00 AM - 10:00 PM, Mondays blocked",
      kycStatus: "review",
      verificationStatus: "review",
      submittedAt: "2026-03-31",
      phone: "+91 90070 10002",
      pendingPayout: 8500,
      documents: ["govt_id", "address_proof", "profile_photo", "service_specialization"],
      documentRecords: [
        { id: "doc_004", type: "voter_id", side: "front", status: "review" },
        { id: "doc_005", type: "voter_id", side: "back", status: "review" },
        { id: "doc_006", type: "service_specialization", side: "single", status: "review" }
      ],
      notes: "Good cross-culture fit. Review punctuality and district commitment before live approval."
    },
    {
      id: "priest_003",
      name: "Pandit Debasish Goswami",
      email: "debasish@dakshina.local",
      district: "North 24 Parganas",
      locality: "Barasat",
      mainCategoryId: "cat_010",
      serviceCategoryId: "cat_012",
      ritualIds: ["ritual_004"],
      services: ["Hastagranthi", "Sankranti"],
      cultureTags: ["Odia", "Bengali"],
      languageTags: ["Odia", "Bengali", "Hindi"],
      radiusKm: 22,
      availabilitySummary: "Daily 8:00 AM - 8:00 PM, festival blackout handled manually",
      kycStatus: "approved",
      verificationStatus: "verified",
      submittedAt: "2026-03-29",
      phone: "+91 90070 10003",
      pendingPayout: 0,
      documents: ["govt_id", "address_proof", "profile_photo", "service_specialization", "home_pin"],
      documentRecords: [
        { id: "doc_007", type: "aadhaar", side: "front", status: "approved" },
        { id: "doc_008", type: "aadhaar", side: "back", status: "approved" },
        { id: "doc_009", type: "home_pin", side: "single", status: "approved" }
      ],
      notes: "Verified backup for Odia and Bengali assignments."
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

function normalizePriest(priest: Partial<PriestRecord>, fallback: PriestRecord): PriestRecord {
  return {
    ...fallback,
    ...priest,
    email: priest.email ?? fallback.email ?? `${fallback.id}@dakshina.local`,
    pendingPayout: priest.pendingPayout ?? fallback.pendingPayout,
    cultureTags: priest.cultureTags ?? fallback.cultureTags,
    languageTags: priest.languageTags ?? fallback.languageTags,
    availabilitySummary: priest.availabilitySummary ?? fallback.availabilitySummary,
    documentRecords: priest.documentRecords ?? fallback.documentRecords
  };
}

export async function getPriestStore() {
  try {
    const raw = await readFile(priestFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<PriestStore>;
    return {
      requirements: parsed.requirements ?? fallbackPriests.requirements,
      priests: (parsed.priests ?? fallbackPriests.priests).map((priest, index) =>
        normalizePriest(priest, fallbackPriests.priests[index % fallbackPriests.priests.length])
      )
    };
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
  pendingPayout: number;
  notes: string;
  mainCategoryId: string | null;
  serviceCategoryId: string | null;
  ritualIds: string[];
  services: string[];
  cultureTags: CultureType[];
  languageTags: PriestLanguage[];
  availabilitySummary: string;
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
      pendingPayout: input.pendingPayout,
      notes: input.notes,
      mainCategoryId: input.mainCategoryId,
      serviceCategoryId: input.serviceCategoryId,
      ritualIds: input.ritualIds,
      services: input.services,
      cultureTags: input.cultureTags,
      languageTags: input.languageTags,
      availabilitySummary: input.availabilitySummary
    };
  });

  const next = { ...current, priests };
  await writeStore(next);
  return next;
}

export async function addPriestRecord(input: Omit<PriestRecord, "id">) {
  const current = await getPriestStore();
  const nextId = `priest_${String(current.priests.length + 1).padStart(3, "0")}`;
  const next: PriestStore = {
    ...current,
    priests: [{ id: nextId, ...input }, ...current.priests]
  };
  await writeStore(next);
  return next;
}

export function getPriestMetrics(store: PriestStore) {
  const verifiedPriests = store.priests.filter((priest) => priest.verificationStatus === "verified").length;
  const pendingKyc = store.priests.filter((priest) => priest.kycStatus === "pending").length;
  const districtsCovered = new Set(store.priests.map((priest) => priest.district)).size;
  const culturesCovered = new Set(store.priests.flatMap((priest) => priest.cultureTags)).size;

  return {
    totalPriests: store.priests.length,
    verifiedPriests,
    pendingKyc,
    districtsCovered,
    culturesCovered
  };
}
