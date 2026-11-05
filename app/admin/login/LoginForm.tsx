"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/input";

import { login, type LoginState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="mt-6 space-y-4">
      <input
        type="password"
        name="password"
        required
        autoFocus
        autoComplete="current-password"
        placeholder="Password"
        className={inputClass()}
      />
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Checking…" : "Log in"}
      </Button>
    </form>
  );
}
