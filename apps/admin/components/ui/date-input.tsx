"use client";

import * as Popover from "@radix-ui/react-popover";
import { CalendarDays, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "../../lib/utils";
import { formatDateLabel, formatDateValue, parseDateValue } from "./date-time-utils";

type DateInputProps = {
  name: string;
  defaultValue?: string;
  className?: string;
  required?: boolean;
  min?: string;
  max?: string;
};

export function DateInput({ name, defaultValue, className, required, min, max }: DateInputProps) {
  const [selected, setSelected] = useState<Date | undefined>(() => parseDateValue(defaultValue));
  const minDate = useMemo(() => parseDateValue(min), [min]);
  const maxDate = useMemo(() => parseDateValue(max), [max]);

  return (
    <Popover.Root>
      <input name={name} required={required} type="hidden" value={formatDateValue(selected)} />
      <Popover.Trigger asChild>
        <button
          className={cn(
            "group flex h-11 w-full items-center justify-between rounded-lg border border-border bg-white px-4 text-left text-sm font-medium text-foreground transition-colors hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
            className
          )}
          type="button"
        >
          <span className="flex min-w-0 items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{selected ? formatDateLabel(selected) : "Select date"}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-data-[state=open]:rotate-180" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          className="z-[90] w-[350px] max-w-[calc(100vw-2rem)] rounded-[24px] border border-border bg-white p-4 shadow-2xl outline-none"
          sideOffset={10}
        >
          <DayPicker
            mode="single"
            month={selected}
            onSelect={setSelected}
            selected={selected}
            showOutsideDays
            disabled={(date) => (minDate ? date < minDate : false) || (maxDate ? date > maxDate : false)}
            classNames={{
              months: "flex flex-col gap-4",
              month: "space-y-4",
              caption: "flex items-center justify-between px-1",
              caption_label: "text-sm font-semibold text-foreground",
              nav: "flex items-center gap-1",
              nav_button:
                "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-foreground transition-colors hover:bg-secondary",
              table: "w-full border-collapse",
              head_row: "grid grid-cols-7",
              head_cell: "py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground",
              row: "grid grid-cols-7",
              cell: "p-0 text-center",
              day:
                "mx-auto flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-medium text-foreground transition-colors hover:bg-secondary",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary",
              day_today: "border border-primary/30 bg-primary/10 text-foreground",
              day_outside: "text-muted-foreground/45",
              day_disabled: "text-muted-foreground/30"
            }}
          />
          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              className="rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              onClick={() => setSelected(undefined)}
              type="button"
            >
              Clear
            </button>
            <button
              className="rounded-xl bg-secondary px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/80"
              onClick={() => setSelected(new Date())}
              type="button"
            >
              Today
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
