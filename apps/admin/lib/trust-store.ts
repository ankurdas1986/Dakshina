import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type TrustControlState = "active" | "planned";
export type ReferralState = "pending_completion" | "eligible" | "credited" | "cancelled";
export type ReviewState = "visible" | "pending_moderation" | "hidden";

export type TrustControl = {
  id: string;
  title: string;
  detail: string;
  state: TrustControlState;
};

export type ReferralEntry = {
  id: string;
  referrer: string;
  referee: string;
  firstBooking: string;
  refereeDiscount: string;
  rewardCredit: string;
  state: ReferralState;
  adminNotes: string;
};

export type ReviewEntry = {
  id: string;
  bookingCode: string;
  priest: string;
  rating: number;
  status: ReviewState;
  comment: string;
};

export type TrustScoreEntry = {
  id: string;
  priest: string;
  averageRating: number;
  punctualityScore: number;
  completionQualityScore: number;
  verificationScore: number;
  adminAdjustment: number;
  visibleScore: number;
  notes: string;
};

export type TrustStore = {
  controls: TrustControl[];
  referrals: ReferralEntry[];
  reviews: ReviewEntry[];
  scorecards: TrustScoreEntry[];
};

const trustFilePath = path.join(process.cwd(), "data", "trust.json");

const fallbackStore: TrustStore = {
  controls: [
    {
      id: "control_001",
      title: "Completion-gated referral release",
      detail: "Referrer reward credit is released only after the referee booking is marked completed through OTP.",
      state: "active"
    },
    {
      id: "control_002",
      title: "Review eligibility",
      detail: "Users can rate and review only after the ritual is marked completed.",
      state: "active"
    },
    {
      id: "control_003",
      title: "Trust score visibility",
      detail: "Rating, punctuality, and verification state combine into a visible operational score.",
      state: "planned"
    }
  ],
  referrals: [
    {
      id: "ref_001",
      referrer: "Sagnik Dutta",
      referee: "Ria Banerjee",
      firstBooking: "DK-1042",
      refereeDiscount: "10%",
      rewardCredit: "Rs 150",
      state: "pending_completion",
      adminNotes: "Wait for OTP completion before releasing credit."
    },
    {
      id: "ref_002",
      referrer: "Moumita De",
      referee: "Arpita Sen",
      firstBooking: "DK-1038",
      refereeDiscount: "10%",
      rewardCredit: "Rs 150",
      state: "credited",
      adminNotes: "Credited after verified completion."
    }
  ],
  reviews: [
    {
      id: "review_001",
      bookingCode: "DK-1042",
      priest: "Pandit Arindam Bhattacharya",
      rating: 5,
      status: "visible",
      comment: "Reached on time and completed the ritual properly."
    },
    {
      id: "review_002",
      bookingCode: "DK-1048",
      priest: "Pandit Subhajit Chakraborty",
      rating: 3,
      status: "pending_moderation",
      comment: "Pending moderation because the booking is not yet completed."
    }
  ],
  scorecards: [
    {
      id: "score_001",
      priest: "Pandit Arindam Bhattacharya",
      averageRating: 4.9,
      punctualityScore: 4.8,
      completionQualityScore: 4.9,
      verificationScore: 5,
      adminAdjustment: 0.1,
      visibleScore: 4.9,
      notes: "Strong local reliability. Eligible for higher-priority assignments."
    },
    {
      id: "score_002",
      priest: "Pandit Subhajit Chakraborty",
      averageRating: 4.1,
      punctualityScore: 3.8,
      completionQualityScore: 4.2,
      verificationScore: 3.5,
      adminAdjustment: -0.2,
      visibleScore: 3.9,
      notes: "Keep under observation until punctuality improves."
    }
  ]
};

async function ensureDirectory() {
  await mkdir(path.dirname(trustFilePath), { recursive: true });
}

async function writeStore(store: TrustStore) {
  await ensureDirectory();
  await writeFile(trustFilePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function getTrustStore() {
  try {
    const raw = await readFile(trustFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<TrustStore>;
    return {
      controls: parsed.controls ?? fallbackStore.controls,
      referrals: parsed.referrals ?? fallbackStore.referrals,
      reviews: parsed.reviews ?? fallbackStore.reviews,
      scorecards: parsed.scorecards ?? fallbackStore.scorecards
    };
  } catch {
    await writeStore(fallbackStore);
    return fallbackStore;
  }
}

export async function updateTrustControl(input: TrustControl) {
  const current = await getTrustStore();
  const next: TrustStore = {
    ...current,
    controls: current.controls.map((item) => (item.id === input.id ? input : item))
  };
  await writeStore(next);
  return next;
}

export async function updateReferralEntry(input: ReferralEntry) {
  const current = await getTrustStore();
  const next: TrustStore = {
    ...current,
    referrals: current.referrals.map((item) => (item.id === input.id ? input : item))
  };
  await writeStore(next);
  return next;
}

export async function updateReviewEntry(input: ReviewEntry) {
  const current = await getTrustStore();
  const next: TrustStore = {
    ...current,
    reviews: current.reviews.map((item) => (item.id === input.id ? input : item))
  };
  await writeStore(next);
  return next;
}

export async function updateTrustScoreEntry(input: TrustScoreEntry) {
  const current = await getTrustStore();
  const next: TrustStore = {
    ...current,
    scorecards: current.scorecards.map((item) => (item.id === input.id ? input : item))
  };
  await writeStore(next);
  return next;
}

export function getTrustMetrics(store: TrustStore) {
  const totalRatings = store.reviews.reduce((sum, review) => sum + review.rating, 0);
  return {
    averageRating: store.reviews.length > 0 ? Number((totalRatings / store.reviews.length).toFixed(1)) : 0,
    reviewsAwaitingModeration: store.reviews.filter((review) => review.status === "pending_moderation").length,
    referralCreditsPending: store.referrals.filter((entry) => entry.state !== "credited").length,
    controlItems: store.controls.length,
    priestsBelowThreshold: store.scorecards.filter((entry) => entry.visibleScore < 4).length
  };
}
