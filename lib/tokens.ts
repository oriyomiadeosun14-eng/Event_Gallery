import { createHmac, timingSafeEqual } from "node:crypto";

// Cookie signing shared by server code and proxy.ts. No Next.js imports here, so
// proxy.ts can use it too. Cookies hold an HMAC of the secret, never the secret itself,
// so changing the password or passcode logs everyone out.

export const ADMIN_COOKIE = "admin_session";
export const GUEST_COOKIE = "guest_access";

export const cookieOptions = (maxAgeDays: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * maxAgeDays,
});

function sign(secret: string, purpose: string) {
  return createHmac("sha256", secret).update(purpose).digest("hex");
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

// --- Admin -------------------------------------------------------------------

export function adminToken() {
  const password = process.env.ADMIN_PASSWORD;
  return password ? sign(password, "event-gallery-admin") : null;
}

export function isValidAdminCookie(value: string | undefined) {
  const token = adminToken();
  return Boolean(token && value && safeEqual(value, token));
}

// --- Guests (event passcode) -------------------------------------------------

/** Passcodes are compared case-insensitively, ignoring spaces: "amara 26" works for "AMARA26". */
export function normalizePasscode(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

/** The passcode printed on the QR card, or null when the site is open to everyone. */
export function eventPasscode() {
  const raw = process.env.EVENT_PASSCODE;
  return raw && normalizePasscode(raw) ? normalizePasscode(raw) : null;
}

export function passcodeMatches(candidate: string) {
  const passcode = eventPasscode();
  return Boolean(passcode && safeEqual(normalizePasscode(candidate), passcode));
}

export function guestToken() {
  const passcode = eventPasscode();
  return passcode ? sign(passcode, "event-gallery-guest") : null;
}

export function isValidGuestCookie(value: string | undefined) {
  const token = guestToken();
  return Boolean(token && value && safeEqual(value, token));
}
