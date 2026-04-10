import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CultureType } from "./settings";

export type MasterPanjikaSlot = {
  id: string;
  cultureType: CultureType;
  ritualLabel: string;
  ritualId?: string;
  slotDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  tithi: string;
  sourceNote?: string;
  createdAt: string;
};

export type MasterPanjikaStore = {
  slots: MasterPanjikaSlot[];
};

const storePath = path.join(process.cwd(), "data", "master-panjika.json");

const fallback: MasterPanjikaStore = {
  slots: [
    {
      id: "mp_001",
      cultureType: "Bengali",
      ritualLabel: "Annaprashan",
      ritualId: "ritual_001",
      slotDate: "2026-04-15",
      startTime: "09:30",
      endTime: "11:00",
      tithi: "Shukla Paksha Tritiya",
      sourceNote: "Sample seed slot",
      createdAt: new Date().toISOString()
    }
  ]
};

async function ensureDir() {
  await mkdir(path.dirname(storePath), { recursive: true });
}

async function writeStore(store: MasterPanjikaStore) {
  await ensureDir();
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function getMasterPanjikaStore(): Promise<MasterPanjikaStore> {
  try {
    const raw = await readFile(storePath, "utf8");
    return JSON.parse(raw) as MasterPanjikaStore;
  } catch {
    await writeStore(fallback);
    return fallback;
  }
}

export async function upsertMasterPanjikaSlots(input: Omit<MasterPanjikaSlot, "id" | "createdAt">[]) {
  const current = await getMasterPanjikaStore();
  const now = new Date().toISOString();
  const existing = [...current.slots];

  const keyOf = (slot: { cultureType: CultureType; ritualLabel: string; slotDate: string; startTime: string; endTime: string }) =>
    `${slot.cultureType}||${slot.ritualLabel.toLowerCase()}||${slot.slotDate}||${slot.startTime}||${slot.endTime}`;

  const indexByKey = new Map(existing.map((slot, idx) => [keyOf(slot), idx]));
  const next = [...existing];

  input.forEach((row) => {
    const key = keyOf(row);
    const idx = indexByKey.get(key);
    if (idx === undefined) {
      next.push({
        id: `mp_${String(next.length + 1).padStart(3, "0")}`,
        createdAt: now,
        ...row
      });
      indexByKey.set(key, next.length - 1);
    } else {
      next[idx] = {
        ...next[idx],
        ...row
      };
    }
  });

  const store: MasterPanjikaStore = { slots: next };
  await writeStore(store);
  return store;
}

export async function removeMasterPanjikaSlot(id: string) {
  const current = await getMasterPanjikaStore();
  const store: MasterPanjikaStore = { slots: current.slots.filter((slot) => slot.id !== id) };
  await writeStore(store);
  return store;
}

export async function getRecommendedSlots(params: {
  cultureType: CultureType;
  ritualLabel: string;
  slotDate: string;
  limit?: number;
}) {
  const store = await getMasterPanjikaStore();
  const ritualNeedle = params.ritualLabel.trim().toLowerCase();

  const slots = store.slots
    .filter((slot) => slot.cultureType === params.cultureType)
    .filter((slot) => slot.slotDate === params.slotDate)
    .filter((slot) => (!ritualNeedle ? true : slot.ritualLabel.toLowerCase().includes(ritualNeedle)))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return slots.slice(0, params.limit ?? 3);
}
