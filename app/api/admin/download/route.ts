import { NextResponse, type NextRequest } from "next/server";

import { isAdmin } from "@/lib/auth";
import { createZip } from "@/lib/cloudinary";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/download?type=image|video&album=<slug>&scope=approved|all
 * Builds a ZIP in Cloudinary and redirects to it.
 */
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ message: "Admin login required." }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;
  const type = params.get("type") === "video" ? "VIDEO" : "IMAGE";
  const albumSlug = params.get("album");
  const onlyApproved = params.get("scope") !== "all";

  const where: Prisma.MediaWhereInput = {
    type,
    ...(onlyApproved ? { status: "APPROVED" } : {}),
    ...(albumSlug ? { album: { slug: albumSlug } } : {}),
  };

  const rows = await prisma.media.findMany({ where, select: { publicId: true } });
  if (rows.length === 0) {
    return NextResponse.json({ message: "Nothing to download for that selection." }, { status: 404 });
  }

  const name = [albumSlug ?? "wedding", type === "VIDEO" ? "videos" : "photos"].join("-");
  try {
    const zipUrl = await createZip({ publicIds: rows.map((r) => r.publicId), type, name });
    return NextResponse.redirect(zipUrl);
  } catch (error) {
    console.error("ZIP creation failed", error);
    return NextResponse.json({ message: "Cloudinary could not build the ZIP. Check your plan's archive limits." }, { status: 502 });
  }
}
