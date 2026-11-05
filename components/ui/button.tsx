import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

/**
 * Every button colour lives here. Pick by role, not by colour:
 * - primary   the default call to action (ink, light label)
 * - accent    THE main call to action on a screen; use at most once per screen
 * - outline   secondary actions next to a primary one
 * - secondary positive admin actions such as "Approve"
 * - subtle    quiet toggles on a white card
 * - highlight a toggle that is switched on (e.g. "Featured")
 * - danger    destructive actions such as "Delete"
 */
const variants = {
  primary: "border-primary bg-primary text-bg hover:bg-primary/90",
  accent: "border-terracotta bg-terracotta text-ink hover:bg-terracotta/90",
  outline: "border-primary bg-transparent text-ink hover:bg-ink/5",
  secondary: "border-sage bg-sage text-ink hover:bg-sage/90",
  subtle: "border-border bg-surface text-ink hover:border-sage",
  highlight: "border-sky bg-sky text-ink",
  danger: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100",
} as const;

const sizes = {
  sm: "gap-2 rounded-full px-3 py-1 text-xs",
  md: "gap-2 rounded-full px-4 py-2 text-sm font-medium",
  lg: "gap-2 rounded-full px-6 py-3 text-sm font-semibold",
  xl: "gap-3 rounded-3xl px-6 py-5 text-lg font-semibold",
  icon: "rounded-full py-2",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

type StyleOptions = { variant?: ButtonVariant; size?: ButtonSize; className?: string };

/** Button classes, for anything that should look like a button (e.g. a `<Link>`). */
export function buttonClass({ variant = "primary", size = "lg", className }: StyleOptions = {}) {
  return cn(
    "inline-flex items-center justify-center border text-center transition disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & Omit<StyleOptions, "className">;

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass({ variant, size, className })} {...props} />;
}
