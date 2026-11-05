import { NextResponse } from "next/server";

import { hasGuestAccess } from "@/lib/auth";
import { MESSAGE_LIMITS } from "@/lib/messages";
import { prisma } from "@/lib/prisma";

const text = (value: unknown, max: number) =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;

/** A guest leaves a guestbook message. Held for review unless AUTO_APPROVE_UPLOADS=true. */
export async function POST(req: Request) {
  if (!(await hasGuestAccess())) {
    return NextResponse.json({ message: "Please enter the event passcode first." }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: "Invalid request body." }, { status: 400 });

  // Honeypot: a field real guests never see. Bots that fill it get a fake success.
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ status: "PENDING" }, { status: 201 });
  }

  const name = text(body.name, MESSAGE_LIMITS.name);
  const message = text(body.body, MESSAGE_LIMITS.body);
  if (!name || !message) {
    return NextResponse.json({ message: "Please add your name and a message." }, { status: 400 });
  }

  const created = await prisma.message.create({
    data: {
      name,
      relation: text(body.relation, MESSAGE_LIMITS.relation),
      body: message,
      status: process.env.AUTO_APPROVE_UPLOADS === "true" ? "APPROVED" : "PENDING",
    },
    select: { id: true, status: true },
  });

  return NextResponse.json(created, { status: 201 });
}
