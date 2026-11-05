/**
 * Read a colour token (defined once in app/globals.css) from JavaScript, for things
 * that can't be styled with CSS classes, such as the Cloudinary upload widget.
 * Returns the fallback during server rendering, where there is no document.
 */
export function themeColor(token: string, fallback = "#000000") {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--color-${token}`).trim();
  return value || fallback;
}
