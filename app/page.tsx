import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { EventStats } from "@/components/EventStats";
import { MessageCard } from "@/components/MessageCard";
import { buttonClass } from "@/components/ui/button";
import { cardClass } from "@/components/ui/card";
import { event } from "@/lib/event";
import { getApprovedMessages } from "@/lib/queries";

/** The three newest guestbook messages, with a way in to read or write more. */
async function LatestMessages() {
  const messages = await getApprovedMessages(3);

  if (messages.length === 0) {
    return (
      <div className={cardClass({ tone: "empty", className: "rounded-[28px] p-10 text-center" })}>
        <p>No messages yet.</p>
        <Link href="/messages" className={buttonClass({ variant: "outline", className: "mt-4" })}>
          Leave the first note
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {messages.map((message) => (
        <MessageCard key={message.id} message={message} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <section className={cardClass({ tone: "sky", className: "relative overflow-hidden rounded-[40px] shadow-2xl shadow-ink/10" })}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--color-surface)_35%,transparent),transparent_50%)]" />
        <div className="relative grid gap-8 p-6 md:grid-cols-[1.3fr_0.7fr] md:p-10 lg:p-12">
          <div className="flex flex-col justify-center">
            <p className="font-name text-5xl leading-none text-ink sm:text-6xl">{event.couple}</p>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-5xl leading-none text-ink sm:text-6xl lg:text-8xl">
              A weekend to remember.
            </h1>
            <p className="mt-6 max-w-xl text-base text-ink sm:text-lg">
              {event.dateLong} · Join us in sharing the best moments from the celebration.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/upload" className={buttonClass()}>
                Share your moments
              </Link>
              <Link href="/gallery" className={buttonClass({ variant: "outline" })}>
                Browse the gallery
              </Link>
            </div>

            <Suspense fallback={<p className="mt-6 h-5 text-sm text-ink" />}>
              <EventStats className="mt-6 text-sm text-ink" />
            </Suspense>
          </div>

          <div className="relative">
            <div className={cardClass({ className: "rounded-4xl p-3" })}>
              <Image
                src={event.heroImage.src}
                alt={event.heroImage.alt}
                width={event.heroImage.width}
                height={event.heroImage.height}
                sizes="(min-width: 768px) 40vw, 100vw"
                preload
                className={`h-[420px] w-full rounded-3xl object-cover ${event.heroImage.focus}`}
              />
            </div>
            <div className="absolute -bottom-4 left-4 rounded-3xl border border-border bg-surface/90 px-4 py-3 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.25em] text-ink-muted">Date</p>
              <p className="mt-1 text-lg font-semibold text-ink">{event.dateShort}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-4xl font-semibold text-ink">Messages</h2>
          <Link href="/messages" className="text-sm text-ink underline underline-offset-4 hover:text-ink-muted">
            Read all and leave yours
          </Link>
        </div>
        <Suspense fallback={<p className="text-ink-muted">Loading messages…</p>}>
          <LatestMessages />
        </Suspense>
      </section>

      <section className="mt-16 grid gap-5 md:grid-cols-3">
        {[
          { title: "Easy upload", body: "A guest-first upload flow designed for phones and quick uploads at the venue." },
          { title: "Private approval", body: "The couple can review, hide, or feature moments before they go live." },
          { title: "Memories in one place", body: "Photo and video moments are organized by ceremony, reception, and dance floor." },
        ].map((item) => (
          <div key={item.title} className={cardClass({ className: "rounded-[28px] p-6" })}>
            <p className="text-xs uppercase tracking-[0.25em] text-ink-muted">{item.title}</p>
            <p className="mt-3 text-base leading-7 text-ink">{item.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
