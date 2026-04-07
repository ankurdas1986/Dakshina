"use client";

import * as Popover from "@radix-ui/react-popover";
import { format } from "date-fns";
import { CalendarDays, ChevronDown, Clock3 } from "lucide-react";
import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "../../lib/utils";
import {
  combineDateAndTime,
  formatDateTimeLabel,
  formatDateTimeValue,
  parseDateTimeValue,
  parseTimeValue,
  type TimeParts
} from "./date-time-utils";

type DateTimePickerProps = {
  name: string;
  defaultValue?: string;
  className?: string;
  required?: boolean;
  placeholder?: string;
};

const HOURS = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));

export function DateTimePicker({
  name,
  defaultValue,
  className,
  required,
  placeholder = "Select date and time"
}: DateTimePickerProps) {
  const initial = parseDateTimeValue(defaultValue);
  const [date, setDate] = useState<Date | undefined>(initial);
  const [time, setTime] = useState<TimeParts>(
    initial
      ? { hour: format(initial, "hh"), minute: format(initial, "mm"), period: format(initial, "a") as TimeParts["period"] }
      : parseTimeValue("09:00 AM")
  );
  const minuteOptions = useMemo(() => Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0")), []);
  const value = combineDateAndTime(date, time);

  return (
    <Popover.Root>
      <input name={name} required={required} type="hidden" value={formatDateTimeValue(value)} />
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
            <span className="truncate">{value ? formatDateTimeLabel(value) : placeholder}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-data-[state=open]:rotate-180" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          className="z-[90] w-[620px] max-w-[calc(100vw-2rem)] rounded-[24px] border border-border bg-white p-4 shadow-2xl outline-none"
          sideOffset={10}
        >
          <div className="mb-3">
            <p className="text-sm font-semibold text-foreground">Choose date and time</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Use a single picker for exact timestamp fields.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[20px] border border-border bg-secondary/20 p-3">
              <DayPicker mode="single" month={date} onSelect={setDate} selected={date} showOutsideDays className="rdp-modern" />
            </div>
            <div className="rounded-[20px] border border-border bg-secondary/20 p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Clock3 className="h-4 w-4 text-primary" />
                Time
              </div>
              <div className="grid grid-cols-3 gap-2">
                <PickerColumn label="Hour" options={HOURS} selected={time.hour} onSelect={(hour) => setTime((current) => ({ ...current, hour }))} />
                <PickerColumn label="Minute" options={minuteOptions} selected={time.minute} onSelect={(minute) => setTime((current) => ({ ...current, minute }))} />
                <PickerColumn label="Period" options={["AM", "PM"]} selected={time.period} onSelect={(period) => setTime((current) => ({ ...current, period: period as TimeParts["period"] }))} />
              </div>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function PickerColumn({
  label,
  options,
  selected,
  onSelect
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="rounded-[18px] border border-border bg-white p-2">
      <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <div className="surface-scroll max-h-40 space-y-1 overflow-y-auto pr-1">
        {options.map((option) => (
          <button
            className={cn(
              "flex h-9 w-full items-center justify-center rounded-xl text-sm font-semibold transition-colors",
              option === selected ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-secondary"
            )}
            key={option}
            onClick={() => onSelect(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
