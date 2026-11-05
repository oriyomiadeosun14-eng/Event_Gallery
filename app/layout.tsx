import type { Metadata } from "next";
import { Allura, Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

import { TopNav } from "@/components/TopNav";
import { event } from "@/lib/event";

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Script font for the couple's name only (use the `font-name` class).
const nameFont = Allura({
  variable: "--font-allura",
  subsets: ["latin"],
  weight: "400",
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: `${event.couple} · Wedding Gallery`, template: `%s · ${event.couple}` },
  description: "Share photos and videos from the celebration through a private guest gallery.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${displayFont.variable} ${nameFont.variable} ${bodyFont.variable} h-full antialiased`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-full bg-bg text-ink">
        <TopNav />
        {children}
      </body>
    </html>
  );
}
