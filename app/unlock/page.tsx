import { cardClass } from "@/components/ui/card";
import { event } from "@/lib/event";

import { UnlockForm } from "./UnlockForm";

export const metadata = { title: "Welcome" };

export default async function UnlockPage({ searchParams }: PageProps<"/unlock">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/";
  const wrongCode = params.error === "1";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className={cardClass({ raised: true, className: "rounded-4xl p-8 text-center" })}>
        <p className="font-name text-5xl leading-none text-ink">{event.couple}</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">Welcome to our gallery</h1>
        <p className="mt-3 text-sm text-ink-muted">
          Enter the passcode from the card on your table, or just scan its QR code.
        </p>
        <UnlockForm
          next={next}
          initialError={wrongCode ? "That link's passcode didn't work. Please type the one on your card." : undefined}
        />
      </div>
    </main>
  );
}
