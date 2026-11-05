import { Suspense } from "react";

import { MediaGrid } from "@/components/MediaGrid";
import { cardClass } from "@/components/ui/card";
import { getFeaturedMedia } from "@/lib/queries";

export const metadata = { title: "Highlights" };

async function Highlights() {
  const highlights = await getFeaturedMedia();

  return highlights.length > 0 ? (
    <MediaGrid items={highlights} />
  ) : (
    <div className={cardClass({ tone: "empty", className: "rounded-[28px] p-10 text-center" })}>
      No favourites picked yet. Star a few in the admin page to build the highlight reel.
    </div>
  );
}

export default function HighlightsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className={cardClass({ tone: "sky", raised: true, className: "mb-8 rounded-4xl p-6" })}>
        <p className="text-xs uppercase tracking-[0.32em] text-ink">Best of the wedding</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl">A highlight reel of the weekend.</h1>
      </section>

      <Suspense fallback={<p className="text-ink-muted">Loading favourites…</p>}>
        <Highlights />
      </Suspense>
    </main>
  );
}
