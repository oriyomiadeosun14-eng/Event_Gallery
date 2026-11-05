"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Download, X } from "lucide-react";

import { getDisplayUrl, getVideoUrl, type MediaItem } from "@/lib/media";

type LightboxProps = {
  items: MediaItem[];
  selectedIndex: number;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
};

/** Cloudinary's fl_attachment makes the browser save the original instead of opening it. */
function downloadUrl(item: MediaItem) {
  return item.url.includes("/upload/") ? item.url.replace("/upload/", "/upload/fl_attachment/") : item.url;
}

export function Lightbox({ items, selectedIndex, onClose, onSelectIndex }: LightboxProps) {
  const current = items[selectedIndex];
  const count = items.length;
  const next = () => onSelectIndex((selectedIndex + 1) % count);
  const prev = () => onSelectIndex((selectedIndex - 1 + count) % count);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onSelectIndex((selectedIndex + 1) % count);
      if (event.key === "ArrowLeft") onSelectIndex((selectedIndex - 1 + count) % count);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIndex, count, onClose, onSelectIndex]);

  // Stop the page behind the viewer from scrolling.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Swipe left/right on phones.
  const touchStart = useRef<number | null>(null);

  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
      className="fixed inset-0 z-60 flex flex-col bg-primary/95"
      onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStart.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStart.current;
        touchStart.current = null;
        if (Math.abs(delta) > 50) (delta < 0 ? next : prev)();
      }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-border">
        <span>
          {selectedIndex + 1} / {count}
        </span>
        <div className="flex items-center gap-2">
          <a
            href={downloadUrl(current)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-bg/20 bg-bg/5 text-bg transition hover:bg-bg/15"
            aria-label="Download original"
          >
            <Download className="h-5 w-5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-bg/20 bg-bg/5 text-bg transition hover:bg-bg/15"
            aria-label="Close viewer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
        {current.type === "VIDEO" ? (
          <video
            key={current.id}
            src={getVideoUrl(current)}
            poster={getDisplayUrl(current)}
            controls
            playsInline
            autoPlay
            className="max-h-full max-w-full rounded-lg"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- Cloudinary-sized image
          <img
            key={current.id}
            src={getDisplayUrl(current)}
            alt={current.caption ?? "Wedding memory"}
            className="animate-fade-in max-h-full max-w-full rounded-lg object-contain"
          />
        )}

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-bg/20 bg-primary/40 text-bg transition hover:bg-primary/70 sm:flex"
              aria-label="Previous"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-bg/20 bg-primary/40 text-bg transition hover:bg-primary/70 sm:flex"
              aria-label="Next"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      <div className="px-4 pb-6 pt-3 text-center text-bg">
        {current.caption ? <p className="mx-auto max-w-2xl text-lg text-bg">{current.caption}</p> : null}
        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-border">
          {[current.album?.name, current.uploaderName ? `Shared by ${current.uploaderName}` : null].filter(Boolean).join(" · ")}
        </p>
      </div>
    </div>
  );
}
