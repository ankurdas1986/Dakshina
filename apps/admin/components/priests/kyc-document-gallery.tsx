"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

export type KycDocumentPreview = {
  key: string;
  title: string;
  asset: string;
  sideLabel: string;
  note: string;
};

type KycDocumentGalleryProps = {
  documents: KycDocumentPreview[];
};

export function KycDocumentGallery({ documents }: KycDocumentGalleryProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const selectedDocument = documents.find((document) => document.key === selectedKey) ?? null;

  useEffect(() => {
    if (!selectedKey) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedKey(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedKey]);

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2">
        {documents.map((document) => (
          <button
            className="overflow-hidden rounded-[18px] border border-border bg-white text-left transition-transform hover:-translate-y-0.5 hover:shadow-md"
            key={document.key}
            onClick={() => setSelectedKey(document.key)}
            type="button"
          >
            <div className="relative aspect-[16/10] bg-muted">
              <Image
                alt={`${document.title} ${document.sideLabel}`}
                className="object-cover"
                fill
                sizes="(max-width: 1280px) 100vw, 240px"
                src={document.asset}
              />
            </div>
            <div className="space-y-1 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{document.title}</p>
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {document.sideLabel}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{document.note}</p>
              <p className="text-xs font-semibold text-primary">View large</p>
            </div>
          </button>
        ))}
      </div>

      {selectedDocument ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 px-4 py-6"
          role="dialog"
          onClick={() => setSelectedKey(null)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-[28px] border border-border bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedDocument.title}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedDocument.sideLabel} - {selectedDocument.note}
                </p>
              </div>
              <Button className="h-9 w-9 rounded-xl" onClick={() => setSelectedKey(null)} type="button" variant="secondary">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative aspect-[16/9] bg-muted">
              <Image
                alt={`${selectedDocument.title} ${selectedDocument.sideLabel}`}
                className="object-contain p-6"
                fill
                sizes="100vw"
                src={selectedDocument.asset}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
