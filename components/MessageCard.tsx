import { cardClass } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { initials, type MessageItem } from "@/lib/messages";

// Decorative avatar backgrounds; the initials on them are always ink.
const avatarTones = ["bg-sky", "bg-sage/50"];

export function MessageCard({ message }: { message: MessageItem }) {
  return (
    <article className={cardClass({ className: "animate-fade-in break-inside-avoid rounded-3xl p-6" })}>
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-ink",
            avatarTones[message.id % avatarTones.length],
          )}
        >
          {initials(message.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{message.name}</p>
          {message.relation ? <p className="truncate text-xs text-ink-muted">{message.relation}</p> : null}
        </div>
      </div>
      <p className="mt-4 whitespace-pre-line leading-7 text-ink">{message.body}</p>
    </article>
  );
}
