import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_COOKIE,
  GUEST_COOKIE,
  cookieOptions,
  eventPasscode,
  guestToken,
  isValidAdminCookie,
  isValidGuestCookie,
  passcodeMatches,
} from "@/lib/tokens";

/**
 * Event passcode gate for guest pages. Off unless EVENT_PASSCODE is set.
 * - The QR code links to `/upload?code=PASSCODE`: a matching code sets the cookie and
 *   redirects to the same page without it, so guests never type anything.
 * - Anyone else is sent to /unlock to type the passcode printed on the card.
 * API routes check access themselves (see hasGuestAccess in lib/auth.ts).
 */
export function proxy(request: NextRequest) {
  if (!eventPasscode()) return NextResponse.next();

  const url = request.nextUrl;
  const code = url.searchParams.get("code");

  if (code !== null) {
    const clean = url.clone();
    clean.searchParams.delete("code");
    if (passcodeMatches(code)) {
      const response = NextResponse.redirect(clean);
      response.cookies.set(GUEST_COOKIE, guestToken() as string, cookieOptions(60));
      return response;
    }
  }

  const hasAccess =
    isValidGuestCookie(request.cookies.get(GUEST_COOKIE)?.value) ||
    isValidAdminCookie(request.cookies.get(ADMIN_COOKIE)?.value);
  if (hasAccess) return NextResponse.next();

  const unlock = new URL("/unlock", request.url);
  const next = url.clone();
  next.searchParams.delete("code");
  unlock.searchParams.set("next", next.pathname + next.search);
  if (code !== null) unlock.searchParams.set("error", "1");
  return NextResponse.redirect(unlock);
}

export const config = {
  // Everything except API routes, admin pages, the unlock page, Next.js assets and files with an extension.
  matcher: ["/((?!api|admin|unlock|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
