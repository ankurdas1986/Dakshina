import { NextResponse } from "next/server";
import { getRecommendedSlots } from "../../../../lib/master-panjika-store";
import type { CultureType } from "../../../../lib/settings";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cultureType = (url.searchParams.get("cultureType") ?? "").trim() as CultureType;
  const ritualLabel = (url.searchParams.get("ritualLabel") ?? "").trim();
  const slotDate = (url.searchParams.get("slotDate") ?? "").trim();

  if (!cultureType || !ritualLabel || !slotDate) {
    return NextResponse.json({ slots: [], error: "missing_params" }, { status: 400 });
  }

  const slots = await getRecommendedSlots({ cultureType, ritualLabel, slotDate, limit: 3 });
  return NextResponse.json({ slots });
}
