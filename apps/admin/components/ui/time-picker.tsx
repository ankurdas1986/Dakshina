"use client";

import * as Popover from "@radix-ui/react-popover";
import { Clock3, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { formatTimeLabel, formatTimeValue, parseTimeValue, type TimeParts } from "./date-time-utils";

type TimePickerProps = {
  name: string;
  defaultValue?: string;
  className?: string;
  required?: boolean;
  placeholder?: string;
  minuteStep?: number;
};

const HOURS = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));

export function TimePicker({
  name,
  defaultValue,
  className,
  required,
  placeholder = "Select time",
  minuteStep = 15
}: TimePickerProps) {
  const [value, setValue] = useState<TimeParts>(() => parseTimeValue(defaultValue));
  const minuteOptions = useMemo(
    () => Array.from({ length: Math.floor(60 / minuteStep) }, (_, index) => String(index * minuteStep).padStart(2, "0")),
    [minuteStep]
  );

  return (
    <Popover.Root>
      <input name={name} required={required} type="hidden" value={formatTimeValue(value)} />
      <Popover.Trigger asChild>
        <button
          className={cn(
            "group flex h-11 w-full items-center justify-between rounded-lg border border-border bg-white px-4 text-left text-sm font-medium text-foreground transition-colors hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
            className
          )}
          type="button"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Clock3 className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{formatTimeLabel(value) || placeholder}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-data-[state=open]:rotate-180" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          className="z-[90] w-[320px] rounded-[24px] border border-border bg-white p-4 shadow-2xl outline-none"
          sideOffset={10}
        >
          <div className="mb-3">
            <p className="text-sm font-semibold text-foreground">Choose time</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Use a precise time instead of a free text field.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <PickerColumn
              label="Hour"
              options={HOURS}
              selected={value.hour}
              onSelect={(hour) => setValue((current) => ({ ...current, hour }))}
            />
            <PickerColumn
              label="Minute"
              options={minuteOptions}
              selected={value.minute}
              onSelect={(minute) => setValue((current) => ({ ...current, minute }))}
            />
            <PickerColumn
              label="Period"
              options={["AM", "PM"]}
              selected={value.period}
              onSelect={(period) => setValue((current) => ({ ...current, period: period as TimeParts["period"] }))}
            />
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
    <div className="rounded-[20px] border border-border bg-secondary/20 p-2">
      <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <div className="surface-scroll max-h-48 space-y-1 overflow-y-auto pr-1">
        {options.map((option) => (
          <button
            className={cn(
              "flex h-10 w-full items-center justify-center rounded-xl text-sm font-semibold transition-colors",
              option === selected ? "bg-primary text-primary-foreground shadow-sm" : "bg-white text-foreground hover:bg-secondary"
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
