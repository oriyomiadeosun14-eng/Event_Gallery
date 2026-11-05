import { cardClass } from "@/components/ui/card";

import { LoginForm } from "./LoginForm";

export const metadata = { title: "Admin login" };

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className={cardClass({ raised: true, className: "rounded-4xl p-8" })}>
        <p className="text-xs uppercase tracking-[0.32em] text-ink-muted">Private admin</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-muted">Enter the admin password to review uploads.</p>
        <LoginForm />
      </div>
    </main>
  );
}
