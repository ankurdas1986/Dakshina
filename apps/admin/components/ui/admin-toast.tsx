"use client";

import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cn } from "../../lib/utils";

type ToastState = {
  kind: "success" | "error";
  title: string;
  detail: string;
};

function toReadable(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function resolveToast(message: string | null, error: string | null): ToastState | null {
  if (error) {
    return {
      kind: "error",
      title: "Action failed",
      detail: toReadable(error)
    };
  }

  if (message) {
    return {
      kind: "success",
      title: "Saved successfully",
      detail: toReadable(message)
    };
  }

  return null;
}

export function AdminToast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  const toast = useMemo(
    () => resolveToast(searchParams.get("message"), searchParams.get("error")),
    [searchParams]
  );

  useEffect(() => {
    setVisible(true);
  }, [toast?.detail, pathname]);

  useEffect(() => {
    if (!toast || !visible) {
      return;
    }

    const timer = window.setTimeout(() => {
      setVisible(false);
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete("message");
      nextUrl.searchParams.delete("error");
      window.history.replaceState({}, "", nextUrl.toString());
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [toast, visible]);

  if (!toast || !visible) {
    return null;
  }

  const Icon = toast.kind === "success" ? CheckCircle2 : CircleAlert;

  return (
    <div className="pointer-events-none fixed right-4 top-[5.5rem] z-[70] max-w-[360px]">
      <div
        className={cn(
          "pointer-events-auto flex items-start gap-3 rounded-[22px] border px-4 py-3 shadow-soft backdrop-blur-sm",
          toast.kind === "success"
            ? "border-success/20 bg-emerald-950/92 text-emerald-50"
            : "border-destructive/20 bg-rose-950/92 text-rose-50"
        )}
      >
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{toast.title}</p>
          <p className="mt-1 text-sm leading-6 text-white/80">{toast.detail}</p>
        </div>
        <button
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          onClick={() => setVisible(false)}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
