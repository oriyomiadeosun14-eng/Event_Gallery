import { cn } from "@/lib/cn";

/** Text inputs, selects and textareas. `compact` is the smaller size used inside admin cards. */
export function inputClass({ compact = false, className }: { compact?: boolean; className?: string } = {}) {
  return cn(
    "w-full border border-ink-muted bg-bg text-ink outline-none transition placeholder:text-ink-muted focus:border-ink",
    compact ? "rounded-xl px-3 py-2 text-sm" : "rounded-2xl px-4 py-3 text-base",
    className,
  );
}
