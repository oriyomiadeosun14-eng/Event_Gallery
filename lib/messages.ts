// Client-safe guestbook types and limits, shared by the form, API and admin.
import type { MediaStatus } from "@/lib/media";

export type MessageItem = {
  id: number;
  name: string;
  relation: string | null;
  body: string;
  status: MediaStatus;
  createdAt: string;
};

export const MESSAGE_LIMITS = { name: 80, relation: 80, body: 1000 } as const;

/** "Ngozi Okafor" -> "NO", "tari" -> "T" */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0]?.[0] ?? "?")).toUpperCase();
}
