"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import { useRef } from "react";
import { cn } from "../../lib/utils";

type DateInputProps = {
  name: string;
  defaultValue?: string;
  className?: string;
  required?: boolean;
  min?: string;
  max?: string;
};

export function DateInput({ name, defaultValue, className, required, min, max }: DateInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className={cn("group flex h-11 items-center rounded-lg border border-border bg-white px-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20", className)}>
      <CalendarDays className="mr-2 h-4 w-4 shrink-0 text-primary" />
      <input
        className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none [color-scheme:light] [&::-webkit-calendar-picker-indicator]:hidden"
        defaultValue={defaultValue}
        max={max}
        min={min}
        name={name}
        ref={inputRef}
        required={required}
        type="date"
      />
      <button
        className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        onClick={() => inputRef.current?.showPicker?.()}
        type="button"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}
