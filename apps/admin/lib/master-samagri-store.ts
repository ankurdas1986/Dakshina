import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CultureType } from "./settings";

export type MasterSamagriItem = {
  id: string;
  cultureType: CultureType;
  ritualLabel: string;
  ritualId?: string;
  itemName: string;
  defaultQuantity: number;
  unit: string;
  isOptional: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

export type MasterSamagriStore = {
  items: MasterSamagriItem[];
};

const storePath = path.join(process.cwd(), "data", "master-samagri.json");

const fallback: MasterSamagriStore = {
  items: [
    {
      id: "ms_001",
      cultureType: "Bengali",
      ritualLabel: "Satyanarayan Puja",
      ritualId: "ritual_001",
      itemName: "Ghot",
      defaultQuantity: 1,
      unit: "pcs",
      isOptional: false,
      sortOrder: 1,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "ms_002",
      cultureType: "Bengali",
      ritualLabel: "Satyanarayan Puja",
      ritualId: "ritual_001",
      itemName: "Flowers",
      defaultQuantity: 1,
      unit: "bundle",
      isOptional: true,
      sortOrder: 2,
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ]
};

async function ensureDir() {
  await mkdir(path.dirname(storePath), { recursive: true });
}

async function writeStore(store: MasterSamagriStore) {
  await ensureDir();
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function getMasterSamagriStore(): Promise<MasterSamagriStore> {
  try {
    const raw = await readFile(storePath, "utf8");
    return JSON.parse(raw) as MasterSamagriStore;
  } catch {
    await writeStore(fallback);
    return fallback;
  }
}

export async function addMasterSamagriItem(input: Omit<MasterSamagriItem, "id" | "createdAt">) {
  const current = await getMasterSamagriStore();
  const now = new Date().toISOString();
  const nextId = `ms_${String(current.items.length + 1).padStart(3, "0")}`;
  const store: MasterSamagriStore = {
    items: [{ id: nextId, createdAt: now, ...input }, ...current.items]
  };
  await writeStore(store);
  return store;
}

export async function updateMasterSamagriItem(input: MasterSamagriItem) {
  const current = await getMasterSamagriStore();
  const store: MasterSamagriStore = {
    items: current.items.map((item) => (item.id === input.id ? input : item))
  };
  await writeStore(store);
  return store;
}

export async function removeMasterSamagriItem(id: string) {
  const current = await getMasterSamagriStore();
  const store: MasterSamagriStore = { items: current.items.filter((item) => item.id !== id) };
  await writeStore(store);
  return store;
}

export async function getMasterSamagriForBooking(params: { cultureType: CultureType; ritualLabel: string }) {
  const store = await getMasterSamagriStore();
  const ritualNeedle = params.ritualLabel.trim().toLowerCase();
  return store.items
    .filter((item) => item.isActive)
    .filter((item) => item.cultureType === params.cultureType)
    .filter((item) => item.ritualLabel.toLowerCase() === ritualNeedle)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.itemName.localeCompare(b.itemName));
}
