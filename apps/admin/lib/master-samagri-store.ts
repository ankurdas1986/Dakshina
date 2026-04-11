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
  localName: string;
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
      localName: "ঘট",
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
      localName: "ফুল",
      defaultQuantity: 1,
      unit: "bundle",
      isOptional: true,
      sortOrder: 2,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "ms_003",
      cultureType: "Bengali",
      ritualLabel: "Satyanarayan Puja",
      ritualId: "ritual_001",
      itemName: "Mango Leaves",
      localName: "আমপাতা",
      defaultQuantity: 5,
      unit: "pcs",
      isOptional: false,
      sortOrder: 3,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "ms_004",
      cultureType: "Bengali",
      ritualLabel: "Satyanarayan Puja",
      ritualId: "ritual_001",
      itemName: "Sindoor",
      localName: "সিঁদুর",
      defaultQuantity: 1,
      unit: "pkt",
      isOptional: false,
      sortOrder: 4,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "ms_005",
      cultureType: "Bengali",
      ritualLabel: "Lakshmi Puja",
      ritualId: "ritual_001",
      itemName: "Ghot",
      localName: "ঘট",
      defaultQuantity: 1,
      unit: "pcs",
      isOptional: false,
      sortOrder: 1,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "ms_006",
      cultureType: "Bengali",
      ritualLabel: "Lakshmi Puja",
      ritualId: "ritual_001",
      itemName: "Alpona Powder",
      localName: "আলপনা গুঁড়ো",
      defaultQuantity: 1,
      unit: "pkt",
      isOptional: false,
      sortOrder: 2,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "ms_007",
      cultureType: "Bengali",
      ritualLabel: "Lakshmi Puja",
      ritualId: "ritual_001",
      itemName: "Dhup",
      localName: "ধূপ",
      defaultQuantity: 1,
      unit: "pkt",
      isOptional: false,
      sortOrder: 3,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "ms_008",
      cultureType: "North_Indian",
      ritualLabel: "Chhath Puja",
      ritualId: "ritual_003",
      itemName: "Soop",
      localName: "सूप",
      defaultQuantity: 2,
      unit: "pcs",
      isOptional: false,
      sortOrder: 1,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "ms_009",
      cultureType: "North_Indian",
      ritualLabel: "Chhath Puja",
      ritualId: "ritual_003",
      itemName: "Fruits",
      localName: "फल",
      defaultQuantity: 1,
      unit: "basket",
      isOptional: false,
      sortOrder: 2,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "ms_010",
      cultureType: "North_Indian",
      ritualLabel: "Chhath Puja",
      ritualId: "ritual_003",
      itemName: "Arghya Setup",
      localName: "अर्घ्य",
      defaultQuantity: 1,
      unit: "set",
      isOptional: false,
      sortOrder: 3,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "ms_011",
      cultureType: "Odia",
      ritualLabel: "Hastagranthi",
      ritualId: "ritual_004",
      itemName: "Marriage Samagri",
      localName: "ବିବାହ ସାମଗ୍ରୀ",
      defaultQuantity: 1,
      unit: "set",
      isOptional: false,
      sortOrder: 1,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "ms_012",
      cultureType: "Odia",
      ritualLabel: "Hastagranthi",
      ritualId: "ritual_004",
      itemName: "Hastagranthi Thread",
      localName: "ହସ୍ତଗ୍ରନ୍ଥି ସୂତା",
      defaultQuantity: 1,
      unit: "pcs",
      isOptional: false,
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

function migrateItem(item: MasterSamagriItem): MasterSamagriItem {
  if (!item.localName) {
    return { ...item, localName: "" };
  }
  return item;
}

export async function getMasterSamagriStore(): Promise<MasterSamagriStore> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as MasterSamagriStore;
    return { items: parsed.items.map(migrateItem) };
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

export async function getMasterSamagriById(id: string): Promise<MasterSamagriItem | undefined> {
  const store = await getMasterSamagriStore();
  const item = store.items.find((i) => i.id === id);
  return item ? migrateItem(item) : undefined;
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
