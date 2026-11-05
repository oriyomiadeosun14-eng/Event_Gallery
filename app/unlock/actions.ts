"use server";

import { redirect } from "next/navigation";

import { grantGuestAccess } from "@/lib/auth";
import { eventPasscode, passcodeMatches } from "@/lib/tokens";

export type UnlockState = { error?: string };

/** Only allow redirects to a path on this site (never `//evil.com` or a full URL). */
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "/";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}

export async function unlock(_prev: UnlockState, formData: FormData): Promise<UnlockState> {
  const next = safeNext(formData.get("next"));
  if (!eventPasscode()) redirect(next);

  const passcode = String(formData.get("passcode") ?? "");
  if (!passcodeMatches(passcode)) {
    // Slow down guessing a little.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { error: "That passcode doesn't match. It's printed on the card under the QR code." };
  }

  await grantGuestAccess();
  redirect(next);
}
