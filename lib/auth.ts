import "server-only";

import { cookies } from "next/headers";

import {
  ADMIN_COOKIE,
  GUEST_COOKIE,
  adminToken,
  cookieOptions,
  eventPasscode,
  guestToken,
  isValidAdminCookie,
  isValidGuestCookie,
  safeEqual,
} from "@/lib/tokens";

// --- Admin -------------------------------------------------------------------

export function checkPassword(candidate: string) {
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(password) && safeEqual(candidate, password as string);
}

export async function isAdmin() {
  // Read cookies first, unconditionally, so pages using this always render per request.
  const cookieStore = await cookies();
  return isValidAdminCookie(cookieStore.get(ADMIN_COOKIE)?.value);
}

export async function startAdminSession() {
  const token = adminToken();
  if (!token) throw new Error("ADMIN_PASSWORD is not set.");
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, cookieOptions(30));
}

export async function endAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

// --- Guests ------------------------------------------------------------------

/**
 * True when this visitor may use the guest pages and APIs: the site has no passcode,
 * or they've entered it (or scanned the QR code), or they're the admin.
 * proxy.ts does the same check for pages; API routes call this directly.
 */
export async function hasGuestAccess() {
  const cookieStore = await cookies();
  if (!eventPasscode()) return true;
  return (
    isValidGuestCookie(cookieStore.get(GUEST_COOKIE)?.value) ||
    isValidAdminCookie(cookieStore.get(ADMIN_COOKIE)?.value)
  );
}

export async function grantGuestAccess() {
  const token = guestToken();
  if (!token) return;
  const cookieStore = await cookies();
  cookieStore.set(GUEST_COOKIE, token, cookieOptions(60));
}
