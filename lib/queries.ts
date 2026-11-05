import "server-only";

import { connection } from "next/server";

import type { Prisma } from "@/lib/generated/prisma/client";
import { galleryMoments, type MediaItem } from "@/lib/media";
import type { MessageItem } from "@/lib/messages";
import { prisma } from "@/lib/prisma";

const mediaInclude = { album: { select: { id: true, name: true, slug: true } } } as const;

type MediaWithAlbum = Prisma.MediaGetPayload<{ include: typeof mediaInclude }>;

export function toMediaItem(row: MediaWithAlbum): MediaItem {
  return {
    id: row.id,
    url: row.url,
    publicId: row.publicId,
    type: row.type,
    width: row.width,
    height: row.height,
    uploaderName: row.uploaderName,
    caption: row.caption,
    status: row.status,
    featured: row.featured,
    album: row.album,
    createdAt: row.createdAt.toISOString(),
  };
}

let albumsReady: Promise<unknown> | null = null;

/** Make sure the default moments exist as albums. Runs once per server process. */
export function ensureAlbums() {
  albumsReady ??= prisma.album
    .createMany({ data: galleryMoments.map((m) => ({ name: m.name, slug: m.slug })), skipDuplicates: true })
    .catch((error) => {
      albumsReady = null;
      throw error;
    });
  return albumsReady;
}

export async function getAlbums() {
  await connection();
  await ensureAlbums();
  return prisma.album.findMany({ orderBy: { id: "asc" }, select: { id: true, name: true, slug: true } });
}

export type GalleryFilters = {
  type?: "IMAGE" | "VIDEO";
  albumSlug?: string;
  page: number;
  pageSize: number;
};

/** Approved media for the public gallery. Returns everything up to `page`, for "load more". */
export async function getGalleryMedia({ type, albumSlug, page, pageSize }: GalleryFilters) {
  await connection();
  const where: Prisma.MediaWhereInput = {
    status: "APPROVED",
    ...(type ? { type } : {}),
    ...(albumSlug ? { album: { slug: albumSlug } } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.media.findMany({
      where,
      include: mediaInclude,
      orderBy: { createdAt: "desc" },
      take: page * pageSize,
    }),
    prisma.media.count({ where }),
  ]);

  return { items: rows.map(toMediaItem), total };
}

export async function getFeaturedMedia() {
  await connection();
  const rows = await prisma.media.findMany({
    where: { status: "APPROVED", featured: true },
    include: mediaInclude,
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toMediaItem);
}

export async function getAllMediaForAdmin() {
  await connection();
  const rows = await prisma.media.findMany({
    include: mediaInclude,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(toMediaItem);
}

// --- Guestbook ---------------------------------------------------------------

type MessageRow = { id: number; name: string; relation: string | null; body: string; status: MediaItem["status"]; createdAt: Date };

export function toMessageItem(row: MessageRow): MessageItem {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

/** Approved guestbook messages, newest first. */
export async function getApprovedMessages(limit?: number) {
  await connection();
  const rows = await prisma.message.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });
  return rows.map(toMessageItem);
}

export async function getAllMessagesForAdmin() {
  await connection();
  const rows = await prisma.message.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }] });
  return rows.map(toMessageItem);
}

// --- Counters ----------------------------------------------------------------

/** "248 memories from 61 guests": approved uploads, and how many named guests shared them. */
export async function getEventStats() {
  await connection();
  const [memories, guests, messages] = await Promise.all([
    prisma.media.count({ where: { status: "APPROVED" } }),
    // MySQL's default collation groups names case-insensitively, so "Mia" and "mia" count once.
    prisma.media.groupBy({ by: ["uploaderName"], where: { status: "APPROVED", uploaderName: { not: null } } }),
    prisma.message.count({ where: { status: "APPROVED" } }),
  ]);
  return { memories, guests: guests.length, messages };
}
