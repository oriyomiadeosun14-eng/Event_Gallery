"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cardClass } from "@/components/ui/card";
import { inputClass } from "@/components/ui/input";
import { MESSAGE_LIMITS } from "@/lib/messages";

type Status = "idle" | "sending" | "sent" | "error";

export function MessageForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [body, setBody] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? "Could not send your message.");
      form.reset();
      setBody("");
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your message.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className={cardClass({ raised: true, className: "animate-fade-in rounded-4xl p-8 text-center" })}>
        <CheckCircle2 className="mx-auto h-10 w-10 text-ink" />
        <h2 className="mt-3 text-3xl text-ink">Thank you for your note</h2>
        <p className="mx-auto mt-2 max-w-md text-ink">It will appear here once the couple has read it.</p>
        <Button variant="outline" className="mt-6" onClick={() => setStatus("idle")}>
          Write another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cardClass({ raised: true, className: "space-y-5 rounded-4xl p-6" })}>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm text-ink">
          <span>Your name</span>
          <input name="name" required maxLength={MESSAGE_LIMITS.name} autoComplete="name" className={inputClass()} />
        </label>
        <label className="space-y-2 text-sm text-ink">
          <span>
            How do you know the couple? <span className="text-ink-muted">(optional)</span>
          </span>
          <input
            name="relation"
            maxLength={MESSAGE_LIMITS.relation}
            placeholder="e.g. Bridesmaid, Uncle of the groom"
            className={inputClass()}
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm text-ink">
        <span>Your message</span>
        <textarea
          name="body"
          required
          rows={4}
          maxLength={MESSAGE_LIMITS.body}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="A wish, a memory from the day, or advice for the years ahead…"
          className={inputClass()}
        />
        <span className="block text-right text-xs text-ink-muted">
          {body.length} / {MESSAGE_LIMITS.body}
        </span>
      </label>

      {/* Honeypot for bots: hidden from people and screen readers. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {status === "error" ? <p className="text-sm text-red-700">{error}</p> : null}

      <Button type="submit" variant="accent" disabled={status === "sending"} className="w-full sm:w-auto">
        {status === "sending" ? "Sending…" : "Leave your message"}
      </Button>
    </form>
  );
}
