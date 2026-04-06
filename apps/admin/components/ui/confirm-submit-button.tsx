"use client";

import { useId, useRef, useState } from "react";
import type { ButtonHTMLAttributes } from "react";
import { AlertTriangle } from "lucide-react";
import { Button, buttonVariants } from "./button";
import { cn } from "../../lib/utils";

type ConfirmSubmitButtonProps = {
  label: string;
  title: string;
  description: string;
  confirmLabel?: string;
  formAction?: ButtonHTMLAttributes<HTMLButtonElement>["formAction"];
  className?: string;
};

export function ConfirmSubmitButton({
  label,
  title,
  description,
  confirmLabel = "Delete",
  formAction,
  className
}: ConfirmSubmitButtonProps) {
  const [open, setOpen] = useState(false);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <>
      <button
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-xl border border-destructive/30 px-4 text-sm font-semibold text-destructive transition hover:bg-destructive/5",
          className
        )}
        onClick={() => setOpen(true)}
        type="button"
      >
        {label}
      </button>

      <button formAction={formAction} hidden ref={confirmButtonRef} type="submit" />

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/40 p-4">
          <div
            aria-describedby={descriptionId}
            aria-labelledby={titleId}
            aria-modal="true"
            className="w-full max-w-md rounded-[24px] border border-border bg-white p-6 shadow-2xl"
            role="alertdialog"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-foreground" id={titleId}>
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground" id={descriptionId}>
                  {description}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button onClick={() => setOpen(false)} type="button" variant="secondary">
                Cancel
              </Button>
              <button
                className={cn(buttonVariants({ size: "default" }), "rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90")}
                onClick={() => {
                  setOpen(false);
                  confirmButtonRef.current?.click();
                }}
                type="button"
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
