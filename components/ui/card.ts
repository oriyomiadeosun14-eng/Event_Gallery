import { cn } from "@/lib/cn";

/**
 * Card and panel colours. Radius and padding stay with each card, since they vary by use.
 * - surface: white card on the page (forms, stats, photo tiles)
 * - sky:     section/header panel (page headers, the home hero)
 * - empty:   dashed placeholder for "nothing here yet"
 */
const tones = {
  surface: "border border-border bg-surface",
  sky: "border border-border bg-sky",
  empty: "border border-dashed border-ink-muted bg-surface text-ink-muted",
} as const;

type CardOptions = { tone?: keyof typeof tones; raised?: boolean; className?: string };

export function cardClass({ tone = "surface", raised = false, className }: CardOptions = {}) {
  return cn(tones[tone], raised && "shadow-xl shadow-ink/10", className);
}
