import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CultureType } from "./settings";

export type BookingStatus =
  | "draft"
  | "pending_priest_confirmation"
  | "awaiting_advance_payment"
  | "confirmed"
  | "contact_window_locked"
  | "contact_window_open"
  | "in_progress"
  | "completed"
  | "cancelled_by_user"
  | "cancelled_by_priest"
  | "cancelled_by_admin"
  | "replacement_in_progress"
  | "expired";

export type BookingRisk = "low" | "medium" | "high";
export type AdvanceState = "pending" | "paid" | "failed" | "refunded";
export type CompletionOtpStatus = "not_issued" | "issued" | "verified" | "expired" | "failed";

export type BookingCase = {
  id: string;
  bookingCode: string;
  cultureType: CultureType;
  ritual: string;
  district: string;
  eventDate: string;
  scheduledWindow: string;
  status: BookingStatus;
  assignedPriest: string;
  advanceState: AdvanceState;
  contactReveal: string;
  risk: BookingRisk;
  replacementRequired: boolean;
  replacementNotes: string;
  completionOtpStatus: CompletionOtpStatus;
  completionOtpIssuedAt: string;
  completionOtpVerifiedAt: string;
  completionOtpAttempts: number;
  completionOtpLastEvent: string;
  pricing: {
    dakshinaAmount: number;
    samagriAddOns: number;
    zoneWiseTravelFee: number;
    peakMultiplier: number;
  };
  governance: {
    minBookingGapHours: number;
    maxBookingWindowDays: number;
    forcedBookingOverride: boolean;
    whatsappConfirmationState: 'not_sent' | 'sent' | 'failed';
  };
  fardSnapshotLockedAt: string;
  fardSnapshot: {
    deliveryMode: "ui_only" | "ui_and_pdf";
    items: Array<{ label: string; quantity: string }>;
  };
};

export type BookingStore = {
  statuses: BookingStatus[];
  replacementPolicy: string[];
  cases: BookingCase[];
};

const bookingFilePath = path.join(process.cwd(), "data", "bookings.json");

const fallbackStore: BookingStore = {
  statuses: [
    "draft",
    "pending_priest_confirmation",
    "awaiting_advance_payment",
    "confirmed",
    "contact_window_locked",
    "contact_window_open",
    "in_progress",
    "completed",
    "cancelled_by_user",
    "cancelled_by_priest",
    "cancelled_by_admin",
    "replacement_in_progress",
    "expired"
  ],
  replacementPolicy: [
    "Replacement starts as an admin-assisted workflow.",
    "Only verified priests inside the required radius are eligible.",
    "Contact stays hidden until replacement is committed and payment state remains valid."
  ],
  cases: [
    {
      id: "booking_001",
      bookingCode: "DK-1042",
      cultureType: "Bengali",
      ritual: "Satyanarayan Puja",
      district: "Howrah",
      eventDate: "2026-04-05",
      scheduledWindow: "08:00 AM - 10:00 AM",
      status: "confirmed",
      assignedPriest: "Pandit Arindam Bhattacharya",
      advanceState: "paid",
      contactReveal: "2026-04-03 10:00",
      risk: "low",
      replacementRequired: false,
      replacementNotes: "None",
      completionOtpStatus: "issued",
      completionOtpIssuedAt: "2026-04-03 09:15",
      completionOtpVerifiedAt: "",
      completionOtpAttempts: 0,
      completionOtpLastEvent: "OTP issued after advance payment confirmation.",
      pricing: { dakshinaAmount: 2200, samagriAddOns: 350, zoneWiseTravelFee: 150, peakMultiplier: 1 },
      governance: { minBookingGapHours: 3, maxBookingWindowDays: 60, forcedBookingOverride: false, whatsappConfirmationState: "sent" },
      fardSnapshotLockedAt: "2026-04-02 17:45",
      fardSnapshot: {
        deliveryMode: "ui_and_pdf",
        items: [
          { label: "Ghot", quantity: "1" },
          { label: "Mango leaves", quantity: "5" },
          { label: "Flowers", quantity: "As required" }
        ]
      }
    },
    {
      id: "booking_002",
      bookingCode: "DK-1048",
      cultureType: "Bengali",
      ritual: "Gaye Holud",
      district: "Hooghly",
      eventDate: "2026-04-08",
      scheduledWindow: "03:00 PM - 06:00 PM",
      status: "awaiting_advance_payment",
      assignedPriest: "Pandit Subhajit Chakraborty",
      advanceState: "pending",
      contactReveal: "payment required",
      risk: "medium",
      replacementRequired: false,
      replacementNotes: "Waiting for user advance.",
      completionOtpStatus: "not_issued",
      completionOtpIssuedAt: "",
      completionOtpVerifiedAt: "",
      completionOtpAttempts: 0,
      completionOtpLastEvent: "OTP is blocked until advance payment is confirmed.",
      pricing: { dakshinaAmount: 8500, samagriAddOns: 2200, zoneWiseTravelFee: 300, peakMultiplier: 1.2 },
      governance: { minBookingGapHours: 3, maxBookingWindowDays: 60, forcedBookingOverride: false, whatsappConfirmationState: "not_sent" },
      fardSnapshotLockedAt: "",
      fardSnapshot: {
        deliveryMode: "ui_and_pdf",
        items: [
          { label: "Haldi tray", quantity: "1" },
          { label: "Flowers", quantity: "Bulk" },
          { label: "Mangal dravya", quantity: "1 set" }
        ]
      }
    },
    {
      id: "booking_003",
      bookingCode: "DK-1051",
      cultureType: "Odia",
      ritual: "Hastagranthi",
      district: "North 24 Parganas",
      eventDate: "2026-04-04",
      scheduledWindow: "11:00 AM - 02:00 PM",
      status: "replacement_in_progress",
      assignedPriest: "Pending reassignment",
      advanceState: "paid",
      contactReveal: "blocked",
      risk: "high",
      replacementRequired: true,
      replacementNotes: "Original priest cancelled. Search verified priest inside radius.",
      completionOtpStatus: "failed",
      completionOtpIssuedAt: "2026-04-03 18:00",
      completionOtpVerifiedAt: "",
      completionOtpAttempts: 2,
      completionOtpLastEvent: "Original priest cancellation invalidated the previous completion flow.",
      pricing: { dakshinaAmount: 7600, samagriAddOns: 2100, zoneWiseTravelFee: 280, peakMultiplier: 1.1 },
      governance: { minBookingGapHours: 3, maxBookingWindowDays: 60, forcedBookingOverride: true, whatsappConfirmationState: "failed" },
      fardSnapshotLockedAt: "2026-04-01 14:30",
      fardSnapshot: {
        deliveryMode: "ui_only",
        items: [
          { label: "Marriage samagri", quantity: "1 set" },
          { label: "Hastagranthi thread", quantity: "1" }
        ]
      }
    }
  ]
};

async function ensureDirectory() {
  await mkdir(path.dirname(bookingFilePath), { recursive: true });
}

async function writeStore(store: BookingStore) {
  await ensureDirectory();
  await writeFile(bookingFilePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function getBookingStore() {
  try {
    const raw = await readFile(bookingFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<BookingStore>;
    return {
      statuses: parsed.statuses ?? fallbackStore.statuses,
      replacementPolicy: parsed.replacementPolicy ?? fallbackStore.replacementPolicy,
      cases: (parsed.cases ?? fallbackStore.cases).map((item, index) => ({
        ...fallbackStore.cases[index % fallbackStore.cases.length],
        ...item,
        cultureType: item.cultureType ?? fallbackStore.cases[index % fallbackStore.cases.length].cultureType,
        scheduledWindow: item.scheduledWindow ?? fallbackStore.cases[index % fallbackStore.cases.length].scheduledWindow,
        pricing: item.pricing ?? fallbackStore.cases[index % fallbackStore.cases.length].pricing,
        governance: item.governance ?? fallbackStore.cases[index % fallbackStore.cases.length].governance,
        fardSnapshot: item.fardSnapshot ?? fallbackStore.cases[index % fallbackStore.cases.length].fardSnapshot,
        fardSnapshotLockedAt: item.fardSnapshotLockedAt ?? fallbackStore.cases[index % fallbackStore.cases.length].fardSnapshotLockedAt,
        completionOtpStatus: item.completionOtpStatus ?? fallbackStore.cases[index % fallbackStore.cases.length].completionOtpStatus,
        completionOtpIssuedAt: item.completionOtpIssuedAt ?? fallbackStore.cases[index % fallbackStore.cases.length].completionOtpIssuedAt,
        completionOtpVerifiedAt: item.completionOtpVerifiedAt ?? fallbackStore.cases[index % fallbackStore.cases.length].completionOtpVerifiedAt,
        completionOtpAttempts: item.completionOtpAttempts ?? fallbackStore.cases[index % fallbackStore.cases.length].completionOtpAttempts,
        completionOtpLastEvent: item.completionOtpLastEvent ?? fallbackStore.cases[index % fallbackStore.cases.length].completionOtpLastEvent
      }))
    };
  } catch {
    await writeStore(fallbackStore);
    return fallbackStore;
  }
}

export async function updateBookingCase(input: BookingCase) {
  const current = await getBookingStore();
  const next: BookingStore = {
    ...current,
    cases: current.cases.map((item) => (item.id === input.id ? input : item))
  };
  await writeStore(next);
  return next;
}

export function getBookingMetrics(store: BookingStore) {
  return {
    activeBookings: store.cases.filter((item) => ["confirmed", "contact_window_locked", "contact_window_open", "in_progress"].includes(item.status)).length,
    paymentPending: store.cases.filter((item) => item.advanceState === "pending").length,
    replacementCases: store.cases.filter((item) => item.replacementRequired).length,
    completionPending: store.cases.filter((item) => ["issued", "failed"].includes(item.completionOtpStatus) || item.status === "in_progress" || item.status === "contact_window_open").length,
    culturesCovered: new Set(store.cases.map((item) => item.cultureType)).size
  };
}
