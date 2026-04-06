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
export type RefundState = "not_requested" | "pending_manual" | "processed";

export type BookingCase = {
  id: string;
  bookingCode: string;
  userId: string;
  userName: string;
  userPhone: string;
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
  refundState: RefundState;
  pendingRefundAmount: number;
  refundReason: string;
  pricing: {
    dakshinaAmount: number;
    samagriAddOns: number;
    zoneWiseTravelFee: number;
    peakMultiplier: number;
    walletAdvanceApplied: number;
  };
  governance: {
    minBookingGapHours: number;
    maxBookingWindowDays: number;
    forcedBookingOverride: boolean;
    whatsappConfirmationState: 'not_sent' | 'sent' | 'failed';
  };
  policySnapshot: {
    capturedAt: string;
    refundRules: {
      moreThan72HoursPercent: number;
      between24And72HoursPercent: number;
      lessThan24HoursPercent: number;
    };
    advancePaymentPercent: number;
    manualRazorpayRefund: boolean;
  };
  subscriptionId?: string;
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
      userId: "user_001",
      userName: "Sourav Banerjee",
      userPhone: "+91 98300 11001",
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
      refundState: "not_requested",
      pendingRefundAmount: 0,
      refundReason: "",
      pricing: { dakshinaAmount: 2200, samagriAddOns: 350, zoneWiseTravelFee: 150, peakMultiplier: 1, walletAdvanceApplied: 550 },
      governance: { minBookingGapHours: 3, maxBookingWindowDays: 60, forcedBookingOverride: false, whatsappConfirmationState: "sent" },
      policySnapshot: {
        capturedAt: "2026-04-02 17:45",
        refundRules: { moreThan72HoursPercent: 100, between24And72HoursPercent: 70, lessThan24HoursPercent: 25 },
        advancePaymentPercent: 20,
        manualRazorpayRefund: true
      },
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
      userId: "user_002",
      userName: "Ria Banerjee",
      userPhone: "+91 98300 11002",
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
      refundState: "not_requested",
      pendingRefundAmount: 0,
      refundReason: "",
      pricing: { dakshinaAmount: 8500, samagriAddOns: 2200, zoneWiseTravelFee: 300, peakMultiplier: 1.2, walletAdvanceApplied: 0 },
      governance: { minBookingGapHours: 3, maxBookingWindowDays: 60, forcedBookingOverride: false, whatsappConfirmationState: "not_sent" },
      policySnapshot: {
        capturedAt: "",
        refundRules: { moreThan72HoursPercent: 100, between24And72HoursPercent: 70, lessThan24HoursPercent: 25 },
        advancePaymentPercent: 20,
        manualRazorpayRefund: true
      },
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
      userId: "user_003",
      userName: "Smruti Mohanty",
      userPhone: "+91 98300 11003",
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
      refundState: "pending_manual",
      pendingRefundAmount: 1140,
      refundReason: "Priest cancellation after advance payment.",
      pricing: { dakshinaAmount: 7600, samagriAddOns: 2100, zoneWiseTravelFee: 280, peakMultiplier: 1.1, walletAdvanceApplied: 0 },
      governance: { minBookingGapHours: 3, maxBookingWindowDays: 60, forcedBookingOverride: true, whatsappConfirmationState: "failed" },
      policySnapshot: {
        capturedAt: "2026-04-01 14:30",
        refundRules: { moreThan72HoursPercent: 100, between24And72HoursPercent: 70, lessThan24HoursPercent: 25 },
        advancePaymentPercent: 20,
        manualRazorpayRefund: true
      },
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
        pricing: {
          ...fallbackStore.cases[index % fallbackStore.cases.length].pricing,
          ...item.pricing
        },
        governance: {
          ...fallbackStore.cases[index % fallbackStore.cases.length].governance,
          ...item.governance
        },
        policySnapshot: item.policySnapshot ?? fallbackStore.cases[index % fallbackStore.cases.length].policySnapshot,
        fardSnapshot: {
          ...fallbackStore.cases[index % fallbackStore.cases.length].fardSnapshot,
          ...item.fardSnapshot
        },
        fardSnapshotLockedAt: item.fardSnapshotLockedAt ?? fallbackStore.cases[index % fallbackStore.cases.length].fardSnapshotLockedAt,
        completionOtpStatus: item.completionOtpStatus ?? fallbackStore.cases[index % fallbackStore.cases.length].completionOtpStatus,
        completionOtpIssuedAt: item.completionOtpIssuedAt ?? fallbackStore.cases[index % fallbackStore.cases.length].completionOtpIssuedAt,
        completionOtpVerifiedAt: item.completionOtpVerifiedAt ?? fallbackStore.cases[index % fallbackStore.cases.length].completionOtpVerifiedAt,
        completionOtpAttempts: item.completionOtpAttempts ?? fallbackStore.cases[index % fallbackStore.cases.length].completionOtpAttempts,
        completionOtpLastEvent: item.completionOtpLastEvent ?? fallbackStore.cases[index % fallbackStore.cases.length].completionOtpLastEvent,
        refundState: item.refundState ?? fallbackStore.cases[index % fallbackStore.cases.length].refundState,
        pendingRefundAmount: item.pendingRefundAmount ?? fallbackStore.cases[index % fallbackStore.cases.length].pendingRefundAmount,
        refundReason: item.refundReason ?? fallbackStore.cases[index % fallbackStore.cases.length].refundReason
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

export async function addBookingCase(input: Omit<BookingCase, "id">) {
  const current = await getBookingStore();
  const nextId = `booking_${String(current.cases.length + 1).padStart(3, "0")}`;
  const next: BookingStore = {
    ...current,
    cases: [{ id: nextId, ...input }, ...current.cases]
  };
  await writeStore(next);
  return next;
}

export function getBookingMetrics(store: BookingStore) {
  return {
    activeBookings: store.cases.filter((item) => ["confirmed", "contact_window_locked", "contact_window_open", "in_progress"].includes(item.status)).length,
    paymentPending: store.cases.filter((item) => item.advanceState === "pending").length,
    replacementCases: store.cases.filter((item) => item.replacementRequired).length,
    refundCases: store.cases.filter((item) => item.pendingRefundAmount > 0).length,
    completionPending: store.cases.filter((item) => ["issued", "failed"].includes(item.completionOtpStatus) || item.status === "in_progress" || item.status === "contact_window_open").length,
    culturesCovered: new Set(store.cases.map((item) => item.cultureType)).size
  };
}
