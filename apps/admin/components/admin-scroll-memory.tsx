"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const SCROLL_MEMORY_KEY = "dakshina-admin-scroll-memory";

type ScrollMemoryPayload = {
  pathname: string;
  scrollY: number;
};

function readScrollMemory() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(SCROLL_MEMORY_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ScrollMemoryPayload;
  } catch {
    window.sessionStorage.removeItem(SCROLL_MEMORY_KEY);
    return null;
  }
}

function writeScrollMemory(payload: ScrollMemoryPayload) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(SCROLL_MEMORY_KEY, JSON.stringify(payload));
}

export function AdminScrollMemory() {
  const pathname = usePathname();
  const restoredRef = useRef(false);

  useEffect(() => {
    restoredRef.current = false;
  }, [pathname]);

  useEffect(() => {
    const handleSubmit = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLFormElement)) {
        return;
      }

      writeScrollMemory({
        pathname,
        scrollY: window.scrollY
      });
    };

    document.addEventListener("submit", handleSubmit, true);
    return () => document.removeEventListener("submit", handleSubmit, true);
  }, [pathname]);

  useEffect(() => {
    if (restoredRef.current) {
      return;
    }

    const payload = readScrollMemory();
    if (!payload || payload.pathname !== pathname) {
      return;
    }

    restoredRef.current = true;
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: payload.scrollY, behavior: "auto" });
      window.sessionStorage.removeItem(SCROLL_MEMORY_KEY);
    });
  }, [pathname]);

  return null;
}
