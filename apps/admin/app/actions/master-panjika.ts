"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseCsv } from "../../lib/csv";
import type { CultureType } from "../../lib/settings";
import { removeMasterPanjikaSlot, upsertMasterPanjikaSlots } from "../../lib/master-panjika-store";

function normalizeTime(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  // Accept HH:mm or HH:mm:ss and normalize to HH:mm.
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return trimmed;

  const hour = match[1].padStart(2, "0");
  return `${hour}:${match[2]}`;
}

export async function bulkUploadMasterPanjika(formData: FormData) {
  const csvText = String(formData.get("csvText") ?? "");
  const file = formData.get("csvFile");
  let raw = csvText;

  if (!raw && file instanceof File) {
    raw = await file.text();
  }

  if (!raw.trim()) {
    redirect(`/dashboard/rituals/panjika?error=${encodeURIComponent("missing_csv")}`);
  }

  const { rows } = parseCsv(raw);
  const normalized = rows
    .map((row) => {
      const cultureType = (row.culture_type || row.culture || row.culturetype || "").trim() as CultureType;
      const ritualLabel = (row.ritual_label || row.ritual || row.ritualname || "").trim();
      const ritualId = (row.ritual_id || row.ritualid || "").trim() || undefined;
      const slotDate = (row.slot_date || row.date || row.day || "").trim();
      const startTime = normalizeTime(row.start_time || row.start || row.from || "");
      const endTime = normalizeTime(row.end_time || row.end || row.to || "");
      const tithi = (row.tithi || "").trim();
      const sourceNote = (row.source || row.source_note || row.note || "").trim() || undefined;

      if (!cultureType || !ritualLabel || !slotDate || !startTime || !endTime) {
        return null;
      }

      return { cultureType, ritualLabel, ritualId, slotDate, startTime, endTime, tithi, sourceNote };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  if (!normalized.length) {
    redirect(`/dashboard/rituals/panjika?error=${encodeURIComponent("invalid_rows")}`);
  }

  await upsertMasterPanjikaSlots(normalized);
  revalidatePath("/dashboard/rituals/panjika");
  redirect(`/dashboard/rituals/panjika?message=${encodeURIComponent("master_panjika_uploaded")}`);
}

export async function deleteMasterPanjikaSlot(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    redirect(`/dashboard/rituals/panjika?error=${encodeURIComponent("missing_id")}`);
  }

  await removeMasterPanjikaSlot(id);
  revalidatePath("/dashboard/rituals/panjika");
  redirect(`/dashboard/rituals/panjika?message=${encodeURIComponent("master_panjika_deleted")}`);
}
