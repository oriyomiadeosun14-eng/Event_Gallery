import Link from "next/link";
import { Suspense } from "react";

import { MediaGrid } from "@/components/MediaGrid";
import { buttonClass } from "@/components/ui/button";
import { cardClass } from "@/components/ui/card";
import { chipClass } from "@/components/ui/chip";
import { GALLERY_PAGE_SIZE } from "@/lib/media";
import { statsSentence } from "@/components/EventStats";
import { getAlbums, getEventStats, getGalleryMedia } from "@/lib/queries";

export const metadata = { title: "Gallery" };

type Search = { type?: string; album?: string; page?: string };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function hrefWith(current: Search, changes: Partial<Search>) {
  const next = { ...current, ...changes };
  const params = new URLSearchParams();
  if (next.type) params.set("type", next.type);
  if (next.album) params.set("album", next.album);
  if (next.page && next.page !== "1") params.set("page", next.page);
  const query = params.toString();
  return query ? `/gallery?${query}` : "/gallery";
}

async function Gallery({ searchParams }: { searchParams: PageProps<"/gallery">["searchParams"] }) {
  const raw = await searchParams;
  const typeParam = first(raw.type);
  const albumParam = first(raw.album);
  const page = Math.max(1, Math.min(50, Number(first(raw.page)) || 1));

  const current: Search = {
    type: typeParam === "image" || typeParam === "video" ? typeParam : undefined,
    album: albumParam || undefined,
  };

  const [albums, { items, total }, stats] = await Promise.all([
    getAlbums(),
    getGalleryMedia({
      type: current.type === "image" ? "IMAGE" : current.type === "video" ? "VIDEO" : undefined,
      albumSlug: current.album,
      page,
      pageSize: GALLERY_PAGE_SIZE,
    }),
    getEventStats(),
  ]);

  const typeOptions = [
    { value: undefined, label: "All" },
    { value: "image", label: "Photos" },
    { value: "video", label: "Videos" },
  ];

  return (
    <>
      <div className="mb-4 flex justify-end">
        <span className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-ink-muted">
          {current.type || current.album ? `${total} of ${stats.memories} memories` : statsSentence(stats)}
        </span>
      </div>

      <nav aria-label="Gallery filters" className="mb-8 space-y-4">
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {typeOptions.map((option) => (
            <Link
              key={option.label}
              href={hrefWith(current, { type: option.value, page: undefined })}
              className={chipClass(current.type === option.value, "shrink-0")}
              scroll={false}
            >
              {option.label}
            </Link>
          ))}
        </div>

        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href={hrefWith(current, { album: undefined, page: undefined })} className={chipClass(!current.album, "shrink-0")} scroll={false}>
            All moments
          </Link>
          {albums.map((album) => (
            <Link
              key={album.slug}
              href={hrefWith(current, { album: album.slug, page: undefined })}
              className={chipClass(current.album === album.slug, "shrink-0")}
              scroll={false}
            >
              {album.name}
            </Link>
          ))}
        </div>
      </nav>

      {items.length > 0 ? (
        <>
          <MediaGrid items={items} />

          {items.length < total ? (
            <div className="mt-10 text-center">
              <Link
                href={hrefWith(current, { page: String(page + 1) })}
                scroll={false}
                className={buttonClass()}
              >
                Load more memories
              </Link>
            </div>
          ) : null}
        </>
      ) : (
        <div className={cardClass({ tone: "empty", className: "rounded-[28px] p-10 text-center" })}>
          {current.type || current.album ? (
            <>No memories match this filter yet. Try another moment or check back later.</>
          ) : (
            <>
              Nothing here yet.{" "}
              <Link href="/upload" className="text-ink underline underline-offset-4">
                Be the first to share a moment
              </Link>
              .
            </>
          )}
        </div>
      )}
    </>
  );
}

function GallerySkeleton() {
  return (
    <div className="columns-2 gap-3 sm:gap-4 xl:columns-3" aria-busy="true">
      {[320, 220, 280, 360, 240, 300].map((h, i) => (
        <div key={i} className="mb-3 animate-pulse rounded-[20px] bg-sky/30 sm:mb-4" style={{ height: h }} />
      ))}
    </div>
  );
}

export default function GalleryPage({ searchParams }: PageProps<"/gallery">) {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className={cardClass({ tone: "sky", raised: true, className: "mb-6 rounded-4xl p-6" })}>
        <p className="text-xs uppercase tracking-[0.32em] text-ink">Guest gallery</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl">Every moment, one share at a time.</h1>
      </section>

      <Suspense fallback={<GallerySkeleton />}>
        <Gallery searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
