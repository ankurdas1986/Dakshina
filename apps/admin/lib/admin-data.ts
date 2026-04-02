import { settingsSnapshot } from "./settings";

export const moduleStatus = [
  {
    key: "settings",
    title: "Global Settings",
    href: "/dashboard",
    status: "live",
    summary: "Commercial rules, privacy timing, district overrides, and rollout controls."
  },
  {
    key: "priests",
    title: "Priest Management",
    href: "/dashboard/priests",
    status: "live",
    summary: "Onboarding queue, manual KYC review, verification decisions, and service radius visibility."
  },
  {
    key: "rituals",
    title: "Rituals and Fard",
    href: "/dashboard/rituals",
    status: "live",
    summary: "4-tier service catalog, ritual pricing posture, and JSON-based Fard templates."
  },
  {
    key: "bookings",
    title: "Bookings",
    href: "/dashboard/bookings",
    status: "live",
    summary: "Booking status control, district dispatch, delayed contact reveal, and replacement workflow."
  },
  {
    key: "trust",
    title: "Trust and Referral",
    href: "/dashboard/trust",
    status: "live",
    summary: "Review oversight, completion-gated referral reward logic, and quality monitoring."
  }
] as const;

export const priestSnapshot = {
  totals: {
    totalPriests: 42,
    verifiedPriests: 28,
    pendingKyc: 9,
    districtsCovered: 3
  },
  queue: [
    {
      name: "Pandit Arindam Bhattacharya",
      district: "Howrah",
      locality: "Bally",
      services: ["Lakshmi Puja", "Satyanarayan Puja", "Grihoprobesh"],
      radiusKm: 14,
      kycStatus: "pending",
      submittedAt: "2026-04-01"
    },
    {
      name: "Pandit Subhajit Chakraborty",
      district: "Hooghly",
      locality: "Uttarpara",
      services: ["Wedding", "Sacred Thread", "Annaprashan"],
      radiusKm: 18,
      kycStatus: "review",
      submittedAt: "2026-03-31"
    },
    {
      name: "Pandit Debasish Goswami",
      district: "North 24 Parganas",
      locality: "Barasat",
      services: ["Durga Puja", "Kali Puja", "Community Events"],
      radiusKm: 22,
      kycStatus: "approved",
      submittedAt: "2026-03-29"
    }
  ],
  requirements: [
    "Government ID proof",
    "Address proof",
    "Recent priest profile photo",
    "Primary ritual specialization",
    "Home pin and travel radius"
  ]
};

export const ritualSnapshot = {
  categories: [
    {
      tier: "Tier 1",
      title: "Essential Home",
      rituals: 18,
      fardTemplates: 14,
      pricingMode: "admin-guided"
    },
    {
      tier: "Tier 2",
      title: "Grand Event",
      rituals: 11,
      fardTemplates: 9,
      pricingMode: "hybrid"
    },
    {
      tier: "Tier 3",
      title: "Barwari / Public",
      rituals: 7,
      fardTemplates: 6,
      pricingMode: "admin-guided"
    },
    {
      tier: "Tier 4",
      title: "Monthly Trustee",
      rituals: 4,
      fardTemplates: 2,
      pricingMode: "contract"
    }
  ],
  featuredRituals: [
    {
      ritual: "Lakshmi Puja",
      tier: "Essential Home",
      fardItems: 16,
      delivery: "UI and PDF",
      status: "active"
    },
    {
      ritual: "Wedding Ritual",
      tier: "Grand Event",
      fardItems: 42,
      delivery: "UI and PDF",
      status: "active"
    },
    {
      ritual: "Durga Puja",
      tier: "Barwari / Public",
      fardItems: 57,
      delivery: "UI only",
      status: "draft"
    }
  ],
  fardRules: [
    "Every ritual keeps a JSON template for structured checklist management.",
    "Confirmed bookings store a Fard snapshot so later edits do not alter historical orders.",
    "Users can view or download the checklist after booking confirmation."
  ]
};

export const bookingSnapshot = {
  totals: {
    activeBookings: 19,
    paymentPending: 5,
    replacementCases: 2,
    completionPending: 6
  },
  statuses: [
    "initiated",
    "advance_pending",
    "confirmed",
    "contact_locked",
    "contact_revealed",
    "in_service",
    "otp_pending",
    "completed",
    "cancelled",
    "replacement_requested"
  ],
  cases: [
    {
      bookingId: "DK-1042",
      ritual: "Satyanarayan Puja",
      district: "Howrah",
      priest: "Pandit Arindam Bhattacharya",
      eventDate: "2026-04-05",
      status: "confirmed",
      contactReveal: "2026-04-03 10:00",
      risk: "low"
    },
    {
      bookingId: "DK-1048",
      ritual: "Wedding Ritual",
      district: "Hooghly",
      priest: "Pandit Subhajit Chakraborty",
      eventDate: "2026-04-08",
      status: "advance_pending",
      contactReveal: "payment required",
      risk: "medium"
    },
    {
      bookingId: "DK-1051",
      ritual: "Kali Puja",
      district: "North 24 Parganas",
      priest: "Pending reassignment",
      eventDate: "2026-04-04",
      status: "replacement_requested",
      contactReveal: "blocked",
      risk: "high"
    }
  ],
  replacementPolicy: [
    "Replacement starts as an admin-assisted workflow.",
    "Only verified priests inside the required radius are eligible.",
    "Contact stays hidden until replacement is committed and payment state remains valid."
  ]
};

export const trustSnapshot = {
  metrics: {
    averageRating: 4.7,
    reviewsAwaitingModeration: 8,
    referralCreditsPending: 5,
    priestsBelowThreshold: 3
  },
  controls: [
    {
      title: "Completion-gated referral release",
      detail: "Referrer reward credit is released only after the referee booking is marked completed through OTP.",
      state: "active"
    },
    {
      title: "Review eligibility",
      detail: "Users can rate and review only after the ritual is marked completed.",
      state: "active"
    },
    {
      title: "Trust score visibility",
      detail: "Rating, punctuality, and verification state combine into a visible operational score.",
      state: "planned"
    }
  ],
  referrals: [
    {
      referrer: "Sagnik Dutta",
      referee: "Ria Banerjee",
      firstBooking: "DK-1042",
      refereeDiscount: "10%",
      rewardCredit: "Rs 150",
      state: "pending completion"
    },
    {
      referrer: "Moumita De",
      referee: "Arpita Sen",
      firstBooking: "DK-1038",
      refereeDiscount: "10%",
      rewardCredit: "Rs 150",
      state: "credited"
    }
  ]
};

export const settingsSummary = {
  defaultCommission: `${settingsSnapshot.platform.defaultCommissionPercent}%`,
  advancePayment: `${settingsSnapshot.platform.bookingAdvancePercent}%`,
  revealWindow: `${settingsSnapshot.platform.revealWindowHours.min}-${settingsSnapshot.platform.revealWindowHours.max} hr`,
  launchRegion: settingsSnapshot.platform.launchRegion
};
