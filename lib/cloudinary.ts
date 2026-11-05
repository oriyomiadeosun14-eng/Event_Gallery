import "server-only";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER ?? "wedding";

/**
 * True when the URL points at an asset in *our* Cloudinary account.
 * Stops someone from POSTing arbitrary image URLs into the gallery.
 */
export function isOwnCloudinaryUrl(url: string) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "res.cloudinary.com" &&
      parsed.pathname.startsWith(`/${cloudName}/`)
    );
  } catch {
    return false;
  }
}

/** Remove a file from Cloudinary. Missing files are not treated as errors. */
export async function destroyAsset(publicId: string, type: "IMAGE" | "VIDEO") {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: type === "VIDEO" ? "video" : "image",
    invalidate: true,
  });
}

/**
 * Ask Cloudinary to build a ZIP and return its download URL. The list of IDs is
 * sent in the request body, so this works for hundreds of files. One archive
 * holds one resource type, so photos and videos are downloaded separately.
 * The ZIP is stored in the account under `<folder>/exports`; delete it later if
 * storage is tight.
 */
export async function createZip(options: { publicIds: string[]; type: "IMAGE" | "VIDEO"; name: string }) {
  const result = (await cloudinary.uploader.create_zip({
    public_ids: options.publicIds,
    resource_type: options.type === "VIDEO" ? "video" : "image",
    target_public_id: `${CLOUDINARY_FOLDER}/exports/${options.name}-${Date.now()}`,
    flatten_folders: true,
    allow_missing: true,
  })) as { secure_url?: string };

  if (!result.secure_url) throw new Error("Cloudinary did not return a ZIP URL.");
  return result.secure_url;
}

export { cloudinary };
