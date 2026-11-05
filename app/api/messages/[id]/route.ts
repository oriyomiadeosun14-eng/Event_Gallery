import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/auth";
import type { MediaStatus } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { toMessageItem } from "@/lib/queries";

const statuses: MediaStatus[] = ["PENDING", "APPROVED", "HIDDEN"];

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const unauthorized = () => NextResponse.json({ message: "Admin login required." }, { status: 401 });
const notFound = () => NextResponse.json({ message: "Message not found." }, { status: 404 });

/** Approve or hide a guestbook message. */
export async function PATCH(req: Request, ctx: RouteContext<"/api/messages/[id]">) {
  if (!(await isAdmin())) return unauthorized();
  const id = parseId((await ctx.params).id);
  if (!id) return notFound();

  const body = (await req.json().catch(() => ({}))) as { status?: unknown };
  if (!statuses.includes(body.status as MediaStatus)) {
    return NextResponse.json({ message: "Unknown status." }, { status: 400 });
  }

  try {
    const row = await prisma.message.update({ where: { id }, data: { status: body.status as MediaStatus } });
    return NextResponse.json({ item: toMessageItem(row) });
  } catch {
    return notFound();
  }
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/messages/[id]">) {
  if (!(await isAdmin())) return unauthorized();
  const id = parseId((await ctx.params).id);
  if (!id) return notFound();

  try {
    await prisma.message.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return notFound();
  }
}
