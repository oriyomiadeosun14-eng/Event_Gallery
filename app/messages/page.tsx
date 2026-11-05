import { Suspense } from "react";

import { MessageCard } from "@/components/MessageCard";
import { MessageForm } from "@/components/MessageForm";
import { cardClass } from "@/components/ui/card";
import { event } from "@/lib/event";
import { getApprovedMessages } from "@/lib/queries";

export const metadata = { title: "Messages" };

async function MessageList() {
  const messages = await getApprovedMessages();

  if (messages.length === 0) {
    return (
      <div className={cardClass({ tone: "empty", className: "rounded-[28px] p-10 text-center" })}>
        No messages yet. Be the first to leave a note for {event.couple}.
      </div>
    );
  }

  return (
    <div className="columns-1 gap-4 space-y-4 md:columns-2 lg:columns-3">
      {messages.map((message) => (
        <MessageCard key={message.id} message={message} />
      ))}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className={cardClass({ tone: "sky", raised: true, className: "mb-8 rounded-4xl p-6" })}>
        <p className="text-xs uppercase tracking-[0.32em] text-ink">Guestbook</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl">Leave a note for the couple.</h1>
      </section>

      <div className="mx-auto mb-12 max-w-3xl">
        <MessageForm />
      </div>

      <h2 className="mb-6 text-3xl font-semibold text-ink">Messages</h2>
      <Suspense fallback={<p className="text-ink-muted">Loading messages…</p>}>
        <MessageList />
      </Suspense>
    </main>
  );
}
