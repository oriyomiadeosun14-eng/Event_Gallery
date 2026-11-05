import Link from "next/link";

import { buttonClass } from "@/components/ui/button";
import { event } from "@/lib/event";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/highlights", label: "Highlights" },
  { href: "/messages", label: "Messages" },
  { href: "/upload", label: "Upload" },
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 print:hidden border-b border-border bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary bg-surface text-ink">
            {event.monogram}
          </span>
          <span className="font-name text-2xl leading-none sm:text-3xl">{event.couple}</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-ink md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-ink-muted">
              {item.label}
            </Link>
          ))}
        </div>

        <Link href="/upload" className={buttonClass({ size: "md" })}>
          Share a moment
        </Link>
      </nav>
    </header>
  );
}
