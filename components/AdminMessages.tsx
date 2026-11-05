"use client";

import { useMemo, useState } from "react";
import { Check, EyeOff, Trash2 } from "lucide-react";

import { MessageCard } from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { cardClass } from "@/components/ui/card";
import { chipClass } from "@/components/ui/chip";
import { cn } from "@/lib/cn";
import type { MediaStatus } from "@/lib/media";
import type { MessageItem } from "@/lib/messages";

type Filter = MediaStatus | "ALL";
const labels: Record<Filter, string> = { PENDING: "Pending", APPROVED: "Approved", HIDDEN: "Hidden", ALL: "All" };

export function AdminMessages({ initialMessages }: { initialMessages: MessageItem[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [filter, setFilter] = useState<Filter>(initialMessages.some((m) => m.status === "PENDING") ? "PENDING" : "ALL");
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { PENDING: 0, APPROVED: 0, HIDDEN: 0, ALL: messages.length };
    for (const m of messages) c[m.status]++;
    return c;
  }, [messages]);

  const visible = filter === "ALL" ? messages : messages.filter((m) => m.status === filter);

  async function request(id: number, init: RequestInit, apply: (json: { item?: MessageItem }) => void) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/messages/${id}`, init);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message ?? "Something went wrong");
      apply(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  const setStatus = (id: number, status: MediaStatus) =>
    request(
      id,
      { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) },
      (json) => json.item && setMessages((all) => all.map((m) => (m.id === id ? (json.item as MessageItem) : m))),
    );

  const remove = (id: number) => {
    if (!window.confirm("Delete this message permanently?")) return;
    request(id, { method: "DELETE" }, () => setMessages((all) => all.filter((m) => m.id !== id)));
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {(Object.keys(labels) as Filter[]).map((key) => (
          <button key={key} type="button" onClick={() => setFilter(key)} className={chipClass(filter === key)}>
            {labels[key]} <span className="opacity-60">{counts[key]}</span>
          </button>
        ))}
      </div>

      {error ? (
        <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      {visible.length === 0 ? (
        <div className={cardClass({ tone: "empty", className: "rounded-[28px] p-10 text-center" })}>
          Nothing in “{labels[filter]}”.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((message) => (
            <div key={message.id} className={cn("flex flex-col gap-3", busy === message.id && "opacity-60")}>
              <MessageCard message={message} />
              <div className="flex items-center justify-between gap-2 px-1">
                <span className="text-xs text-ink-muted">
                  {labels[message.status]} · {new Date(message.createdAt).toLocaleString()}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="w-10"
                    disabled={busy === message.id || message.status === "APPROVED"}
                    onClick={() => setStatus(message.id, "APPROVED")}
                    aria-label="Approve"
                    title="Approve"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-10"
                    disabled={busy === message.id || message.status === "HIDDEN"}
                    onClick={() => setStatus(message.id, "HIDDEN")}
                    aria-label="Hide"
                    title="Hide"
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="icon"
                    className="w-10"
                    disabled={busy === message.id}
                    onClick={() => remove(message.id)}
                    aria-label="Delete"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
