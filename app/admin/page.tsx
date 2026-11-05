import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { QrCode } from "lucide-react";

import { AdminBoard } from "@/components/AdminBoard";
import { AdminMessages } from "@/components/AdminMessages";
import { buttonClass } from "@/components/ui/button";
import { cardClass } from "@/components/ui/card";
import { chipClass } from "@/components/ui/chip";
import { isAdmin } from "@/lib/auth";
import { getAlbums, getAllMediaForAdmin, getAllMessagesForAdmin } from "@/lib/queries";

import { logout } from "./actions";

export const metadata = { title: "Admin" };

async function MediaTab() {
  const [items, albums] = await Promise.all([getAllMediaForAdmin(), getAlbums()]);
  return <AdminBoard initialItems={items} albums={albums} />;
}

async function MessagesTab() {
  return <AdminMessages initialMessages={await getAllMessagesForAdmin()} />;
}

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  if (!(await isAdmin())) redirect("/admin/login");
  const tab = (await searchParams).tab === "messages" ? "messages" : "media";

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className={cardClass({ tone: "sky", raised: true, className: "mb-8 flex flex-col gap-4 rounded-4xl p-6 sm:flex-row sm:items-end sm:justify-between" })}>
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-ink">Private admin</p>
          <h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl">Review the wedding gallery</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/qr" className={buttonClass({ variant: "outline", size: "md" })}>
            <QrCode className="h-4 w-4" /> QR cards
          </Link>
          <form action={logout}>
            <button type="submit" className="text-sm text-ink underline-offset-4 hover:text-ink hover:underline">
              Log out
            </button>
          </form>
        </div>
      </section>

      <nav aria-label="Admin sections" className="mb-6 flex gap-2">
        <Link href="/admin" className={chipClass(tab === "media")}>
          Photos &amp; videos
        </Link>
        <Link href="/admin?tab=messages" className={chipClass(tab === "messages")}>
          Messages
        </Link>
      </nav>

      <Suspense key={tab} fallback={<p className="text-ink-muted">Loading…</p>}>
        {tab === "messages" ? <MessagesTab /> : <MediaTab />}
      </Suspense>
    </main>
  );
}
