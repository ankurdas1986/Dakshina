"use client";

import { Clock3, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CultureType } from "../../lib/settings";
import { cn } from "../../lib/utils";
import { DateInput } from "../ui/date-input";
import { Input } from "../ui/input";

type RecommendedSlot = {
  id: string;
  cultureType: CultureType;
  ritualLabel: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  tithi: string;
};

export function BookingAuspiciousAssistFields({
  cultureOptions,
  defaultCulture = "Bengali"
}: {
  cultureOptions: Array<{ value: CultureType; label: string }>;
  defaultCulture?: CultureType;
}) {
  const [cultureType, setCultureType] = useState<CultureType>(defaultCulture);
  const [ritualLabel, setRitualLabel] = useState("");
  const [slotDate, setSlotDate] = useState("");
  const [slots, setSlots] = useState<RecommendedSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const canQuery = Boolean(cultureType && ritualLabel.trim() && slotDate);

  const header = useMemo(() => {
    if (!ritualLabel.trim()) {
      return "Recommended auspicious slots";
    }
    return `Recommended auspicious slots for ${ritualLabel.trim()}`;
  }, [ritualLabel]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!canQuery) {
        setSlots([]);
        return;
      }

      setLoading(true);
      try {
        const url = new URL("/api/master-panjika/recommended", window.location.origin);
        url.searchParams.set("cultureType", cultureType);
        url.searchParams.set("ritualLabel", ritualLabel);
        url.searchParams.set("slotDate", slotDate);
        const response = await fetch(url.toString(), { cache: "no-store" });
        const json = (await response.json()) as { slots?: RecommendedSlot[] };
        if (!cancelled) {
          setSlots(Array.isArray(json.slots) ? json.slots : []);
        }
      } catch {
        if (!cancelled) {
          setSlots([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [canQuery, cultureType, ritualLabel, slotDate]);

  return (
    <div className="xl:col-span-3">
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        <select
          className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground"
          name="cultureType"
          onChange={(event) => setCultureType(event.target.value as CultureType)}
          value={cultureType}
        >
          {cultureOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Input
          className="h-11 rounded-lg"
          name="ritual"
          onChange={(event) => setRitualLabel(event.target.value)}
          placeholder="Ritual"
          required
          value={ritualLabel}
        />
        <DateInput name="eventDate" onValueChange={setSlotDate} />
      </div>

      <div className="mt-3 rounded-[24px] border border-border bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">{header}</p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">Top 3 slots (Master Panjika)</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {canQuery
            ? "Pick one of the recommended windows, or continue with the manual time range below."
            : "Select culture, ritual, and date to see recommended auspicious windows."}
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div className="rounded-[22px] border border-border bg-secondary/20 p-4" key={idx}>
                <div className="h-4 w-24 rounded bg-secondary" />
                <div className="mt-3 h-6 w-32 rounded bg-secondary" />
                <div className="mt-3 h-4 w-full rounded bg-secondary" />
              </div>
            ))
          ) : slots.length ? (
            slots.map((slot, idx) => (
              <div
                className={cn(
                  "rounded-[22px] border border-border bg-gradient-to-br from-amber-50 via-white to-white p-4",
                  idx === 0 ? "alert-ring-low" : idx === 1 ? "alert-ring-medium" : "alert-ring-high"
                )}
                key={slot.id}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Recommended</p>
                <div className="mt-3 flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary" />
                  <p className="text-lg font-semibold text-foreground">
                    {slot.startTime} - {slot.endTime}
                  </p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{slot.tithi || "Auspicious window"}</p>
              </div>
            ))
          ) : (
            <div className="md:col-span-3 rounded-[22px] border border-border bg-secondary/20 px-4 py-6 text-sm text-muted-foreground">
              No recommended slots found for this selection. You can still proceed with a manual time range.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
