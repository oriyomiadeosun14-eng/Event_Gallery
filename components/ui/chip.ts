import { cn } from "@/lib/cn";

/** Filter chips (gallery filters, admin tabs). The selected chip is filled with primary. */
export function chipClass(active: boolean, className?: string) {
  return cn(
    "rounded-full border px-4 py-2 text-sm transition",
    active ? "border-primary bg-primary font-medium text-bg" : "border-border bg-surface text-ink hover:border-sage",
    className,
  );
}
