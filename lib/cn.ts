/** Join class names, skipping false/null/undefined. `cn("a", isOn && "b")` */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
