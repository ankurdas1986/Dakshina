"use client";

import { format, isValid, parse } from "date-fns";

export type TimeParts = {
  hour: string;
  minute: string;
  period: "AM" | "PM";
};

const DATE_PATTERNS = ["yyyy-MM-dd", "dd-MM-yyyy", "yyyy/MM/dd", "dd/MM/yyyy"];
const DATE_TIME_PATTERNS = ["yyyy-MM-dd HH:mm", "yyyy-MM-dd hh:mm a", "dd-MM-yyyy HH:mm", "dd-MM-yyyy hh:mm a"];
const TIME_PATTERNS = ["HH:mm", "hh:mm a", "h:mm a"];

export function parseDateValue(value?: string | null) {
  if (!value) {
    return undefined;
  }

  for (const pattern of DATE_PATTERNS) {
    const parsed = parse(value, pattern, new Date());
    if (isValid(parsed)) {
      return parsed;
    }
  }

  const nativeDate = new Date(value);
  return isValid(nativeDate) ? nativeDate : undefined;
}

export function formatDateValue(date?: Date) {
  return date ? format(date, "yyyy-MM-dd") : "";
}

export function formatDateLabel(date?: Date) {
  return date ? format(date, "dd-MM-yyyy") : "";
}

export function parseDateTimeValue(value?: string | null) {
  if (!value) {
    return undefined;
  }

  for (const pattern of DATE_TIME_PATTERNS) {
    const parsed = parse(value, pattern, new Date());
    if (isValid(parsed)) {
      return parsed;
    }
  }

  const nativeDate = new Date(value);
  return isValid(nativeDate) ? nativeDate : undefined;
}

export function formatDateTimeValue(date?: Date) {
  return date ? format(date, "yyyy-MM-dd HH:mm") : "";
}

export function formatDateTimeLabel(date?: Date) {
  return date ? format(date, "dd MMM yyyy, hh:mm a") : "";
}

export function parseTimeValue(value?: string | null): TimeParts {
  if (!value) {
    return { hour: "09", minute: "00", period: "AM" };
  }

  for (const pattern of TIME_PATTERNS) {
    const parsed = parse(value, pattern, new Date());
    if (isValid(parsed)) {
      return {
        hour: format(parsed, "hh"),
        minute: format(parsed, "mm"),
        period: format(parsed, "a") as "AM" | "PM"
      };
    }
  }

  return { hour: "09", minute: "00", period: "AM" };
}

export function formatTimeValue(parts: TimeParts) {
  return `${parts.hour}:${parts.minute} ${parts.period}`;
}

export function formatTimeLabel(parts: TimeParts) {
  return formatTimeValue(parts);
}

export function combineDateAndTime(date: Date | undefined, parts: TimeParts) {
  if (!date) {
    return undefined;
  }

  const hours = Number(parts.hour) % 12 + (parts.period === "PM" ? 12 : 0);
  const minutes = Number(parts.minute);
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export function splitTimeRange(value?: string | null) {
  if (!value || !value.includes(" - ")) {
    return {
      start: parseTimeValue("09:00 AM"),
      end: parseTimeValue("11:00 AM")
    };
  }

  const [start, end] = value.split(" - ");
  return {
    start: parseTimeValue(start),
    end: parseTimeValue(end)
  };
}

export function formatTimeRangeValue(start: TimeParts, end: TimeParts) {
  return `${formatTimeValue(start)} - ${formatTimeValue(end)}`;
}
