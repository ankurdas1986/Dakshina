import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CultureType } from "./settings";

export type UserAccountStatus = "active" | "blocked" | "deactivated";

export type UserRecord = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  locality: string;
  traditionPreference: CultureType;
  walletBalance: number;
  accountStatus: UserAccountStatus;
  createdAt: string;
  bookingIds: string[];
  notes: string;
};

export type UserStore = {
  users: UserRecord[];
};

const userFilePath = path.join(process.cwd(), "data", "users.json");

const fallbackStore: UserStore = {
  users: [
    {
      id: "user_001",
      fullName: "Sourav Banerjee",
      email: "sourav@dakshina.local",
      phone: "+91 98300 11001",
      address: "12 Bally Ghat Road",
      district: "Howrah",
      locality: "Bally",
      traditionPreference: "Bengali",
      walletBalance: 1250,
      accountStatus: "active",
      createdAt: "2026-04-03",
      bookingIds: ["booking_001"],
      notes: "High-retention Bengali family account."
    },
    {
      id: "user_002",
      fullName: "Ria Banerjee",
      email: "ria@dakshina.local",
      phone: "+91 98300 11002",
      address: "44 Uttarpara Main Road",
      district: "Hooghly",
      locality: "Uttarpara",
      traditionPreference: "Bengali",
      walletBalance: 780,
      accountStatus: "active",
      createdAt: "2026-04-02",
      bookingIds: ["booking_002"],
      notes: "Wedding-event user with active referral history."
    },
    {
      id: "user_003",
      fullName: "Smruti Mohanty",
      email: "smruti@dakshina.local",
      phone: "+91 98300 11003",
      address: "8 Madhyamgram Station Road",
      district: "North 24 Parganas",
      locality: "Madhyamgram",
      traditionPreference: "Odia",
      walletBalance: 420,
      accountStatus: "blocked",
      createdAt: "2026-03-29",
      bookingIds: ["booking_003"],
      notes: "Temporarily blocked after repeated booking disputes."
    }
  ]
};

async function ensureDirectory() {
  await mkdir(path.dirname(userFilePath), { recursive: true });
}

async function writeStore(store: UserStore) {
  await ensureDirectory();
  await writeFile(userFilePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function normalizeUser(user: Partial<UserRecord>, fallback: UserRecord): UserRecord {
  return {
    ...fallback,
    ...user,
    bookingIds: user.bookingIds ?? fallback.bookingIds
  };
}

export async function getUserStore() {
  try {
    const raw = await readFile(userFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<UserStore>;
    return {
      users: (parsed.users ?? fallbackStore.users).map((user, index) =>
        normalizeUser(user, fallbackStore.users[index % fallbackStore.users.length])
      )
    };
  } catch {
    await writeStore(fallbackStore);
    return fallbackStore;
  }
}

export async function updateUserRecord(input: UserRecord) {
  const current = await getUserStore();
  const next: UserStore = {
    users: current.users.map((user) => (user.id === input.id ? input : user))
  };
  await writeStore(next);
  return next;
}

export function getUserMetrics(store: UserStore) {
  return {
    totalUsers: store.users.length,
    activeUsers: store.users.filter((user) => user.accountStatus === "active").length,
    blockedUsers: store.users.filter((user) => user.accountStatus === "blocked").length,
    walletUsers: store.users.filter((user) => user.walletBalance > 0).length
  };
}
