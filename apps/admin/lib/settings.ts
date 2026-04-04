export type CultureType = 'Bengali' | 'North_Indian' | 'Marwadi' | 'Odia' | 'Gujarati';

export type DistrictCommissionOverride = {
  district: string;
  commissionPercent: number;
  serviceClusters: string[];
  zoneTravelFee: number;
  status: 'active' | 'review';
};

export type PanjikaResearchEntry = {
  cultureType: CultureType;
  sources: string[];
  sampleRituals: string[];
  isLaunchPriority: boolean;
};

export type SettingsSnapshot = {
  platform: {
    launchRegion: string;
    currency: string;
    defaultCulture: CultureType;
    bookingAdvancePercent: number;
    defaultCommissionPercent: number;
    revealWindowHours: {
      min: number;
      max: number;
    };
    refereeDiscountPercent: number;
    referrerRewardCredit: number;
    minBookingGapHours: number;
    maxBookingWindowDays: number;
    festivalRushBlockingEnabled: boolean;
    forceBookingOverrideEnabled: boolean;
  };
  districts: DistrictCommissionOverride[];
  serviceTiers: Array<{
    name: string;
    focus: string;
    status: 'active' | 'planned';
  }>;
  cultureResearch: PanjikaResearchEntry[];
  controls: Array<{
    label: string;
    description: string;
    enabled: boolean;
  }>;
  notificationSettings: {
    adminInboxEnabled: boolean;
    registrationAlertsEnabled: boolean;
    bookingAlertsEnabled: boolean;
    kycAlertsEnabled: boolean;
    referralAlertsEnabled: boolean;
    dailyDigestEnabled: boolean;
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
    launchRegion: 'Howrah, Hooghly, North 24 Parganas',
    currency: 'INR',
    defaultCulture: 'Bengali',
    bookingAdvancePercent: 20,
    defaultCommissionPercent: 12,
    revealWindowHours: {
      min: 48,
      max: 72
    },
    refereeDiscountPercent: 10,
    referrerRewardCredit: 150,
    minBookingGapHours: 3,
    maxBookingWindowDays: 60,
    festivalRushBlockingEnabled: true,
    forceBookingOverrideEnabled: true
  },
  districts: [
    {
      district: 'Howrah',
      commissionPercent: 12,
      serviceClusters: ['Bally', 'Domjur', 'Uluberia'],
      zoneTravelFee: 150,
      status: 'active'
    },
    {
      district: 'Hooghly',
      commissionPercent: 10,
      serviceClusters: ['Uttarpara', 'Rishra', 'Srirampore'],
      zoneTravelFee: 180,
      status: 'active'
    },
    {
      district: 'North 24 Parganas',
      commissionPercent: 11,
      serviceClusters: ['Madhyamgram', 'Barasat', 'Dum Dum fringe'],
      zoneTravelFee: 220,
      status: 'review'
    }
  ],
  serviceTiers: [
    {
      name: 'Tier 1: Essential Home',
      focus: 'Recurring household rituals such as Lakshmi and Satyanarayan puja.',
      status: 'active'
    },
    {
      name: 'Tier 2: Grand Event',
      focus: 'Weddings, sacred thread, grihoprobesh, and milestone rituals.',
      status: 'active'
    },
    {
      name: 'Tier 3: Barwari / Public',
      focus: 'Community Durga, Kali, and locality-level puja management.',
      status: 'active'
    },
    {
      name: 'Tier 4: Monthly Trustee',
      focus: 'Recurring temple, society, and complex priest scheduling.',
      status: 'planned'
    }
  ],
  cultureResearch: [
    {
      cultureType: 'Bengali',
      sources: ['Gupta Press', 'Bishuddha Siddhanta'],
      sampleRituals: ['Gaye Holud', 'Bou Bhat', 'Annaprashan'],
      isLaunchPriority: true
    },
    {
      cultureType: 'North_Indian',
      sources: ['Thakur Prasad', 'Vikram Samvat'],
      sampleRituals: ['Chhath Puja', 'Satyanarayan Katha', 'Sindoor Daan'],
      isLaunchPriority: false
    },
    {
      cultureType: 'Marwadi',
      sources: ['Marwari Panchang'],
      sampleRituals: ['Mayra', 'Bhaat', 'Phera Styles'],
      isLaunchPriority: false
    },
    {
      cultureType: 'Odia',
      sources: ['Kohinoor', 'Bhagyadaya Panjika'],
      sampleRituals: ['Boita Bandana', 'Sankranti', 'Hastagranthi'],
      isLaunchPriority: false
    },
    {
      cultureType: 'Gujarati',
      sources: ['Janmabhoomi', 'Gujarati Panchang'],
      sampleRituals: ['Vastu Shanti', 'Mangal Phera', 'Garba Pujan'],
      isLaunchPriority: false
    }
  ],
  controls: [
    {
      label: 'Manual KYC approval',
      description: 'Priest verification stays human-reviewed before any live visibility.',
      enabled: true
    },
    {
      label: 'OTP-based completion',
      description: 'Final completion and referral settlement depend on OTP verification.',
      enabled: true
    },
    {
      label: 'Festival rush blocking',
      description: 'Bookings can be blocked or tightened during high-demand cultural festival periods.',
      enabled: true
    },
    {
      label: 'Forced admin booking override',
      description: 'Super admin can bypass governance rules for manually approved exceptions.',
      enabled: true
    },
    {
      label: 'Strict verified reviews',
      description: 'Only users with completed bookings can leave a review.',
      enabled: true
    }
  ],
  notificationSettings: {
    adminInboxEnabled: true,
    registrationAlertsEnabled: true,
    bookingAlertsEnabled: true,
    kycAlertsEnabled: true,
    referralAlertsEnabled: false,
    dailyDigestEnabled: true
  },
  auditLog: [
    {
      id: 'audit_001',
      action: 'Multicultural rollout policy updated',
      detail: 'Bengali is marked as the default launch culture while North Indian, Marwadi, Odia, and Gujarati remain active in the schema.',
      actor: 'Admin operator',
      createdAt: '2026-04-04 09:10'
    },
    {
      id: 'audit_002',
      action: 'Booking governance aligned',
      detail: 'Minimum booking gap, booking window, and festival blocking defaults were aligned to the new marketplace contract.',
      actor: 'Admin operator',
      createdAt: '2026-04-04 08:45'
    }
  ]
};
