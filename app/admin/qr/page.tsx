import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { QrCode } from "@/components/QrCode";
import { buttonClass } from "@/components/ui/button";
import { cardClass } from "@/components/ui/card";
import { isAdmin } from "@/lib/auth";
import { event } from "@/lib/event";
import { eventPasscode } from "@/lib/tokens";

import { PrintButton } from "./PrintButton";

export const metadata = { title: "QR cards" };

/** The address guests will type or scan: NEXT_PUBLIC_SITE_URL, or the address this page was opened on. */
async function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (configured) return configured;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || /^\d/.test(host) ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function QrPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const base = await siteUrl();
  const passcode = eventPasscode();
  const scanUrl = `${base}/upload${passcode ? `?code=${encodeURIComponent(passcode)}` : ""}`;
  const shortLink = base.replace(/^https?:\/\//, "");
  const isLocalOnly = /\/\/(localhost|127\.0\.0\.1)(:|$)/.test(base);

  const notice = "rounded-2xl border border-sky bg-sky/30 px-4 py-3 text-sm text-ink";

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 print:max-w-none print:p-0">
      <div className="mb-8 space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-semibold text-ink">QR cards</h1>
            <p className="mt-1 text-sm text-ink-muted">One entrance sign and four table cards per page. Print on card stock and cut along the dashed lines.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className={buttonClass({ variant: "outline", size: "md" })}>
              Back to admin
            </Link>
            <PrintButton />
          </div>
        </div>

        {isLocalOnly ? (
          <p className={notice}>
            <strong>Phones can&apos;t open “localhost”.</strong> Set <code>NEXT_PUBLIC_SITE_URL</code> in <code>.env</code> to the
            site&apos;s real address before printing. To test with a phone now, open this page from your network address
            (the “Network” URL that <code>npm run dev</code> prints).
          </p>
        ) : null}
        {!passcode ? (
          <p className={notice}>
            <strong>No passcode set.</strong> Anyone with the link can see the gallery. Add <code>EVENT_PASSCODE</code> to{" "}
            <code>.env</code> to keep it private; the QR code will then let guests in automatically.
          </p>
        ) : null}
        <p className="break-all text-xs text-ink-muted">QR codes open: {scanUrl}</p>
      </div>

      {/* Entrance sign */}
      <section
        className={cardClass({
          className: "mx-auto flex max-w-xl flex-col items-center overflow-hidden rounded-4xl text-center break-after-page [print-color-adjust:exact] print:max-w-none print:rounded-none print:border-0",
        })}
      >
        <div className="w-full bg-sky px-8 py-10">
          <p className="text-xs uppercase tracking-[0.34em] text-ink">{event.dateLong}</p>
          <p className="mt-3 font-name text-7xl leading-none text-ink">{event.couple}</p>
        </div>
        <div className="px-8 py-10">
          <h2 className="text-4xl text-ink">Share your photos &amp; videos</h2>
          <p className="mt-2 text-ink">Point your phone camera at the code. No app or account needed.</p>
          <QrCode value={scanUrl} label={`QR code linking to ${shortLink}`} className="mx-auto mt-8 w-72" />
          <p className="mt-6 text-sm text-ink-muted">or visit</p>
          <p className="text-lg font-semibold text-ink">{shortLink}</p>
          {passcode ? (
            <p className="mt-2 text-sm text-ink">
              Passcode <span className="font-semibold tracking-[0.2em]">{passcode}</span>
            </p>
          ) : null}
        </div>
      </section>

      {/* Table cards: 2 × 2 per A4 sheet */}
      <section className="mt-10 grid grid-cols-2 gap-4 print:mt-0 print:gap-0">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="flex flex-col items-center rounded-3xl border border-dashed border-ink-muted bg-surface px-4 py-6 text-center [print-color-adjust:exact] print:h-[136mm] print:justify-center print:rounded-none"
          >
            <p className="font-name text-4xl leading-tight text-ink">{event.couple}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-ink-muted">Share your photos</p>
            <QrCode value={scanUrl} label={`QR code linking to ${shortLink}`} className="mt-4 w-36" />
            <p className="mt-3 text-sm font-semibold text-ink">{shortLink}</p>
            {passcode ? (
              <p className="text-xs text-ink">
                Passcode <span className="font-semibold tracking-[0.2em]">{passcode}</span>
              </p>
            ) : null}
          </div>
        ))}
      </section>
    </main>
  );
}
