import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import { cn } from "../../lib/utils";
import { buttonVariants } from "./button";

export type CalendarProps = DayPickerProps;

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0", className)}
      classNames={{
        root: "rdp-modern w-full",
        months: "flex w-full flex-col gap-4",
        month: "w-full space-y-4",
        month_caption: "relative flex h-10 items-center justify-center",
        caption_label: "text-sm font-semibold text-foreground",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-9 w-9 rounded-full bg-white p-0 shadow-none"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-9 w-9 rounded-full bg-white p-0 shadow-none"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "border-b border-border/50",
        weekday:
          "pb-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground",
        weeks: "divide-y divide-border/20",
        week: "",
        // Keep table semantics for the day cell; flex on <td> breaks the grid.
        day: "h-11 w-11 p-0 text-center text-sm",
        day_button: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-10 w-10 rounded-2xl border border-transparent bg-transparent p-0 font-semibold text-foreground hover:bg-secondary hover:text-foreground"
        ),
        selected:
          "bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(224,143,36,0.28)] hover:bg-primary hover:text-primary-foreground",
        today: "border border-primary/35 bg-primary/10 text-foreground",
        outside: "text-muted-foreground/40",
        disabled: "cursor-not-allowed text-muted-foreground/30 opacity-60",
        hidden: "invisible",
        ...classNames
      }}
      components={{
        Chevron: ({ orientation, className, ...chevronProps }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("h-4 w-4", className)} {...chevronProps} />
          ) : (
            <ChevronRight className={cn("h-4 w-4", className)} {...chevronProps} />
          )
      }}
      {...props}
    />
  );
}
