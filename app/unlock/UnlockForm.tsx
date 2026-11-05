"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/input";

import { unlock, type UnlockState } from "./actions";

export function UnlockForm({ next, initialError }: { next: string; initialError?: string }) {
  const [state, action, pending] = useActionState<UnlockState, FormData>(unlock, { error: initialError });

  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <input
        name="passcode"
        required
        autoFocus
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        placeholder="Passcode"
        aria-label="Event passcode"
        className={inputClass({ className: "text-center tracking-[0.3em] uppercase" })}
      />
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <Button type="submit" variant="accent" disabled={pending} className="w-full">
        {pending ? "Checking…" : "Enter"}
      </Button>
    </form>
  );
}
