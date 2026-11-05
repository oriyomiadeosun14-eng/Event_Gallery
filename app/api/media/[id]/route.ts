import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/auth";
import { destroyAsset } from "@/lib/cloudinary";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { MediaStatus } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { toMediaItem } from "@/lib/queries";

const statuses: MediaStatus[] = ["PENDING", "APPROVED", "HIDDEN"];

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const unauthorized = () => NextResponse.json({ message: "Admin login required." }, { status: 401 });
const notFound = () => NextResponse.json({ message: "Media not found." }, { status: 404 });

/** Approve, hide, feature, re-caption or move an upload to another album. */
export async function PATCH(req: Request, ctx: RouteContext<"/api/media/[id]">) {
  if (!(await isAdmin())) return unauthorized();

  const id = parseId((await ctx.params).id);
  if (!id) return notFound();

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data: Prisma.MediaUncheckedUpdateInput = {};

  if (body.status !== undefined) {
    if (!statuses.includes(body.status as MediaStatus)) {
      return NextResponse.json({ message: "Unknown status." }, { status: 400 });
    }
    data.status = body.status as MediaStatus;
  }
  if (body.featured !== undefined) data.featured = Boolean(body.featured);
  if (body.caption !== undefined) {
    data.caption = typeof body.caption === "string" && body.caption.trim() ? body.caption.trim().slice(0, 500) : null;
  }
  if (body.albumId !== undefined) {
    if (body.albumId === null) {
      data.albumId = null;
    } else {
      const album = await prisma.album.findUnique({ where: { id: Number(body.albumId) }, select: { id: true } });
      if (!album) return NextResponse.json({ message: "Unknown album." }, { status: 400 });
      data.albumId = album.id;
    }
  }

  // Featuring something only makes sense if guests can see it.
  if (data.featured === true && data.status === undefined) data.status = "APPROVED";

  try {
    const row = await prisma.media.update({
      where: { id },
      data,
      include: { album: { select: { id: true, name: true, slug: true } } },
    });
    return NextResponse.json({ item: toMediaItem(row) });
  } catch {
    return notFound();
  }
}

/** Delete from Cloudinary and the database. */
export async function DELETE(_req: Request, ctx: RouteContext<"/api/media/[id]">) {
  if (!(await isAdmin())) return unauthorized();

  const id = parseId((await ctx.params).id);
  if (!id) return notFound();

  const row = await prisma.media.findUnique({ where: { id } });
  if (!row) return notFound();

  try {
    await destroyAsset(row.publicId, row.type);
  } catch (error) {
    console.error("Cloudinary delete failed", error);
    return NextResponse.json({ message: "Could not delete the file from Cloudinary." }, { status: 502 });
  }

  await prisma.media.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
