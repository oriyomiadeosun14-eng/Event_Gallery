import { NextResponse } from "next/server";

import { hasGuestAccess } from "@/lib/auth";
import { isOwnCloudinaryUrl } from "@/lib/cloudinary";
import { isMomentSlug } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { ensureAlbums } from "@/lib/queries";

type UploadBody = {
  url?: unknown;
  publicId?: unknown;
  resourceType?: unknown;
  width?: unknown;
  height?: unknown;
  uploaderName?: unknown;
  caption?: unknown;
  moment?: unknown;
};

const text = (value: unknown, max: number) =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;

const dimension = (value: unknown) =>
  typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;

/** Called by the upload page once per file, after Cloudinary has stored it. */
export async function POST(req: Request) {
  if (!(await hasGuestAccess())) {
    return NextResponse.json({ message: "Please enter the event passcode first." }, { status: 401 });
  }

  let body: UploadBody;
  try {
    body = (await req.json()) as UploadBody;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const url = typeof body.url === "string" ? body.url : "";
  const publicId = typeof body.publicId === "string" ? body.publicId : "";

  if (!isOwnCloudinaryUrl(url) || !publicId || publicId.length > 255) {
    return NextResponse.json({ message: "That upload did not come from the wedding gallery." }, { status: 400 });
  }

  if (body.resourceType !== "image" && body.resourceType !== "video") {
    return NextResponse.json({ message: "Only photos and videos can be shared." }, { status: 400 });
  }

  // The URL path says what Cloudinary actually stored (/image/upload/ or /video/upload/).
  if (!new URL(url).pathname.includes(`/${body.resourceType}/upload/`)) {
    return NextResponse.json({ message: "Only photos and videos can be shared." }, { status: 400 });
  }

  await ensureAlbums();
  const album = isMomentSlug(body.moment)
    ? await prisma.album.findUnique({ where: { slug: body.moment }, select: { id: true } })
    : null;

  const autoApprove = process.env.AUTO_APPROVE_UPLOADS === "true";

  try {
    const media = await prisma.media.upsert({
      where: { publicId },
      // The widget can fire success twice on retries; don't create duplicates.
      update: {},
      create: {
        url,
        publicId,
        type: body.resourceType === "video" ? "VIDEO" : "IMAGE",
        width: dimension(body.width),
        height: dimension(body.height),
        uploaderName: text(body.uploaderName, 80),
        caption: text(body.caption, 500),
        status: autoApprove ? "APPROVED" : "PENDING",
        albumId: album?.id ?? null,
      },
      select: { id: true, status: true },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    console.error("Failed to save upload", error);
    return NextResponse.json({ message: "Could not save your upload. Please try again." }, { status: 500 });
  }
}
