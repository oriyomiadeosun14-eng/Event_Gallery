import QRCode from "qrcode";

import { cn } from "@/lib/cn";

/**
 * Crisp, print-ready QR code as inline SVG. Dark modules use `currentColor`, so the
 * colour comes from the surrounding text colour (a theme token) instead of a hex value.
 */
export function QrCode({ value, className, label }: { value: string; className?: string; label: string }) {
  const { modules } = QRCode.create(value, { errorCorrectionLevel: "M" });
  const quiet = 4; // the blank border scanners need
  const size = modules.size + quiet * 2;

  let path = "";
  for (let row = 0; row < modules.size; row++) {
    for (let col = 0; col < modules.size; col++) {
      if (modules.get(row, col)) path += `M${col + quiet} ${row + quiet}h1v1h-1z`;
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={label}
      className={cn("text-ink", className)}
    >
      <rect width={size} height={size} className="fill-surface" />
      <path d={path} fill="currentColor" />
    </svg>
  );
}
