import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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

export type BookingCase = {
  id: string;
  bookingCode: string;
  ritual: string;
  district: string;
  eventDate: string;
  status: BookingStatus;
  assignedPriest: string;
  advanceState: AdvanceState;
  contactReveal: string;
  risk: BookingRisk;
  replacementRequired: boolean;
  replacementNotes: string;
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
      ritual: "Satyanarayan Puja",
      district: "Howrah",
      eventDate: "2026-04-05",
      status: "confirmed",
      assignedPriest: "Pandit Arindam Bhattacharya",
      advanceState: "paid",
      contactReveal: "2026-04-03 10:00",
      risk: "low",
      replacementRequired: false,
      replacementNotes: "None"
    },
    {
      id: "booking_002",
      bookingCode: "DK-1048",
      ritual: "Wedding Ritual",
      district: "Hooghly",
      eventDate: "2026-04-08",
      status: "awaiting_advance_payment",
      assignedPriest: "Pandit Subhajit Chakraborty",
      advanceState: "pending",
      contactReveal: "payment required",
      risk: "medium",
      replacementRequired: false,
      replacementNotes: "Waiting for user advance."
    },
    {
      id: "booking_003",
      bookingCode: "DK-1051",
      ritual: "Kali Puja",
      district: "North 24 Parganas",
      eventDate: "2026-04-04",
      status: "replacement_in_progress",
      assignedPriest: "Pending reassignment",
      advanceState: "paid",
      contactReveal: "blocked",
      risk: "high",
      replacementRequired: true,
      replacementNotes: "Original priest cancelled. Search verified priest inside radius."
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
    return JSON.parse(raw) as BookingStore;
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
    activeBookings: store.cases.filter((item) =>
      ["confirmed", "contact_window_locked", "contact_window_open", "in_progress"].includes(item.status)
    ).length,
    paymentPending: store.cases.filter((item) => item.advanceState === "pending").length,
    replacementCases: store.cases.filter((item) => item.replacementRequired).length,
    completionPending: store.cases.filter((item) => item.status === "in_progress" || item.status === "contact_window_open").length
  };
}
