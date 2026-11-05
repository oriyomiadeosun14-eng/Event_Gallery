"use client";

import { useState } from "react";
import { Play } from "lucide-react";

import { Lightbox } from "@/components/Lightbox";
import { cardClass } from "@/components/ui/card";
import { getThumbnailUrl, type MediaItem } from "@/lib/media";

type MediaGridProps = {
  items: MediaItem[];
  title?: string;
};

/** Masonry grid: CSS columns keep every photo at its natural proportions. */
export function MediaGrid({ items, title }: MediaGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <>
      {title ? <h2 className="mb-6 text-2xl font-semibold text-ink">{title}</h2> : null}

      <div className="columns-2 gap-3 sm:gap-4 xl:columns-3">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={cardClass({ className: "group animate-fade-in relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-[20px] text-left shadow-lg shadow-ink/10 transition hover:border-sage sm:mb-4 sm:rounded-[28px]" })}
            aria-label={`Open ${item.type === "VIDEO" ? "video" : "photo"}${item.uploaderName ? ` shared by ${item.uploaderName}` : ""}`}
          >
            <div className="relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary already resizes; next/image would double-process */}
              <img
                src={getThumbnailUrl(item)}
                alt={item.caption ?? (item.uploaderName ? `Shared by ${item.uploaderName}` : "Wedding memory")}
                width={item.width ?? undefined}
                height={item.height ?? undefined}
                loading={index < 6 ? "eager" : "lazy"}
                decoding="async"
                className="h-auto w-full bg-sky/30 object-cover transition duration-500 group-hover:scale-[1.03]"
              />

              {item.type === "VIDEO" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-bg/80 bg-primary/40 text-bg backdrop-blur-sm">
                    <Play className="ml-0.5 h-5 w-5 fill-current" />
                  </span>
                </div>
              ) : null}

              {item.featured ? (
                <span className="absolute left-2 top-2 rounded-full bg-sky px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">
                  Favourite
                </span>
              ) : null}
            </div>

            {item.uploaderName || item.caption ? (
              <div className="space-y-1 px-3 py-2.5 text-sm text-ink sm:px-4 sm:py-3">
                {item.uploaderName ? <p className="truncate font-medium text-ink">{item.uploaderName}</p> : null}
                {item.caption ? <p className="line-clamp-2 text-xs text-ink-muted sm:text-sm">{item.caption}</p> : null}
              </div>
            ) : null}
          </button>
        ))}
      </div>

      {selectedIndex !== null ? (
        <Lightbox
          items={items}
          selectedIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onSelectIndex={setSelectedIndex}
        />
      ) : null}
    </>
  );
}
