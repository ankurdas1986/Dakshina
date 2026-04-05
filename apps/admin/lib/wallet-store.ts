import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type WalletTransactionStatus = "pending" | "completed" | "failed" | "reversed";
export type WalletTransactionType =
  | "advance_payment"
  | "refund_credit"
  | "referral_credit"
  | "manual_adjustment"
  | "priest_settlement";

export type WalletTransaction = {
  id: string;
  userId?: string;
  priestId?: string;
  bookingId?: string;
  payoutId?: string;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  direction: "credit" | "debit";
  amount: number;
  description: string;
  createdAt: string;
};

export type WalletStore = {
  transactions: WalletTransaction[];
};

const walletFilePath = path.join(process.cwd(), "data", "wallet-transactions.json");

const fallbackStore: WalletStore = {
  transactions: [
    {
      id: "wallet_001",
      userId: "user_001",
      bookingId: "booking_001",
      type: "advance_payment",
      status: "completed",
      direction: "debit",
      amount: 550,
      description: "20% advance paid from internal wallet for Satyanarayan Puja.",
      createdAt: "2026-04-03 09:12"
    },
    {
      id: "wallet_002",
      userId: "user_002",
      type: "referral_credit",
      status: "completed",
      direction: "credit",
      amount: 150,
      description: "Referral reward released after completed ritual verification.",
      createdAt: "2026-04-02 18:00"
    },
    {
      id: "wallet_003",
      priestId: "priest_003",
      payoutId: "payout_003",
      type: "priest_settlement",
      status: "completed",
      direction: "credit",
      amount: 2100,
      description: "Manual UPI payout confirmed by admin for Lakshmi Puja.",
      createdAt: "2026-03-30 10:15"
    }
  ]
};

async function ensureDirectory() {
  await mkdir(path.dirname(walletFilePath), { recursive: true });
}

async function writeStore(store: WalletStore) {
  await ensureDirectory();
  await writeFile(walletFilePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function getWalletStore() {
  try {
    const raw = await readFile(walletFilePath, "utf8");
    return JSON.parse(raw) as WalletStore;
  } catch {
    await writeStore(fallbackStore);
    return fallbackStore;
  }
}

export async function appendWalletTransaction(input: WalletTransaction) {
  const current = await getWalletStore();
  const next: WalletStore = {
    transactions: [input, ...current.transactions]
  };
  await writeStore(next);
  return next;
}
