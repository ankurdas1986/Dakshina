export type DistrictCommissionOverride = {
  district: string;
  commissionPercent: number;
  serviceClusters: string[];
  status: "active" | "review";
};

export type SettingsSnapshot = {
  platform: {
    launchRegion: string;
    currency: string;
    bookingAdvancePercent: number;
    defaultCommissionPercent: number;
    revealWindowHours: {
      min: number;
      max: number;
    };
    refereeDiscountPercent: number;
    referrerRewardCredit: number;
  };
  districts: DistrictCommissionOverride[];
  serviceTiers: Array<{
    name: string;
    focus: string;
    status: "active" | "planned";
  }>;
  controls: Array<{
    label: string;
    description: string;
    enabled: boolean;
  }>;
  notificationSettings: {
    adminInboxEnabled: boolean;
    bookingAlertsEnabled: boolean;
    kycAlertsEnabled: boolean;
    referralAlertsEnabled: boolean;
    dailyDigestEnabled: boolean;
    unreadCount: number;
  };
  auditLog: Array<{
    id: string;
    action: string;
    detail: string;
    actor: string;
    createdAt: string;
  }>;
};

export const settingsSnapshot: SettingsSnapshot = {
  platform: {
    launchRegion: "Howrah, Hooghly, North 24 Parganas",
    currency: "INR",
    bookingAdvancePercent: 20,
    defaultCommissionPercent: 12,
    revealWindowHours: {
      min: 48,
      max: 72
    },
    refereeDiscountPercent: 10,
    referrerRewardCredit: 150
  },
  districts: [
    {
      district: "Howrah",
      commissionPercent: 12,
      serviceClusters: ["Bally", "Domjur", "Uluberia"],
      status: "active"
    },
    {
      district: "Hooghly",
      commissionPercent: 10,
      serviceClusters: ["Uttarpara", "Rishra", "Srirampore"],
      status: "active"
    },
    {
      district: "North 24 Parganas",
      commissionPercent: 11,
      serviceClusters: ["Madhyamgram", "Barasat", "Dum Dum fringe"],
      status: "review"
    }
  ],
  serviceTiers: [
    {
      name: "Tier 1: Essential Home",
      focus: "Recurring household rituals such as Lakshmi and Satyanarayan puja.",
      status: "active"
    },
    {
      name: "Tier 2: Grand Event",
      focus: "Weddings, sacred thread, grihoprobesh, and milestone rituals.",
      status: "active"
    },
    {
      name: "Tier 3: Barwari / Public",
      focus: "Community Durga, Kali, and locality-level puja management.",
      status: "active"
    },
    {
      name: "Tier 4: Monthly Trustee",
      focus: "Recurring temple, society, and complex priest scheduling.",
      status: "planned"
    }
  ],
  controls: [
    {
      label: "Manual KYC approval",
      description: "Priest verification stays human-reviewed before any live visibility.",
      enabled: true
    },
    {
      label: "OTP-based completion",
      description: "Final completion and referral settlement depend on OTP verification.",
      enabled: true
    },
    {
      label: "Replacement guarantee flow",
      description: "Admin-assisted reassignment is available for verified priest failure cases.",
      enabled: true
    },
    {
      label: "Public listing auto-approval",
      description: "New priests are published automatically after signup.",
      enabled: false
    }
  ],
  notificationSettings: {
    adminInboxEnabled: true,
    bookingAlertsEnabled: true,
    kycAlertsEnabled: true,
    referralAlertsEnabled: false,
    dailyDigestEnabled: true,
    unreadCount: 4
  },
  auditLog: [
    {
      id: "audit_001",
      action: "Platform settings updated",
      detail: "Default commission and reveal timing were aligned to launch-market policy.",
      actor: "Admin operator",
      createdAt: "2026-04-03 09:30"
    },
    {
      id: "audit_002",
      action: "District override revised",
      detail: "North 24 Parganas commission remains under review until launch coverage stabilizes.",
      actor: "Admin operator",
      createdAt: "2026-04-03 08:10"
    }
  ]
};
