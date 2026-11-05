import { getEventStats } from "@/lib/queries";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "248 memories from 61 guests", or an invitation when nothing has been shared yet. */
export function statsSentence({ memories, guests }: { memories: number; guests: number }) {
  if (memories === 0) return "Be the first to share a memory";
  const shared = plural(memories, "memory", "memories");
  return guests > 0 ? `${shared} from ${plural(guests, "guest", "guests")}` : shared;
}

export async function EventStats({ className }: { className?: string }) {
  const stats = await getEventStats();
  return <p className={className}>{statsSentence(stats)}</p>;
}
