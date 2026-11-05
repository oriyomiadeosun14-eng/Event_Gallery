"use server";

import { redirect } from "next/navigation";

import { checkPassword, endAdminSession, startAdminSession } from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!process.env.ADMIN_PASSWORD) {
    return { error: "ADMIN_PASSWORD is not set in .env." };
  }
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    // Slow down guessing a little.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { error: "That password isn't right." };
  }
  await startAdminSession();
  redirect("/admin");
}

export async function logout() {
  await endAdminSession();
  redirect("/admin/login");
}
