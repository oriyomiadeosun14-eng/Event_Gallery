// Client-safe types and helpers shared by the gallery, upload and admin pages.
// Nothing in here may import the Prisma client or the Cloudinary SDK.

export type MediaType = "IMAGE" | "VIDEO";
export type MediaStatus = "PENDING" | "APPROVED" | "HIDDEN";

export type AlbumSummary = {
  id: number;
  name: string;
  slug: string;
};

/** Serializable shape passed from server components to client components. */
export type MediaItem = {
  id: number;
  url: string;
  publicId: string;
  type: MediaType;
  width: number | null;
  height: number | null;
  uploaderName: string | null;
  caption: string | null;
  status: MediaStatus;
  featured: boolean;
  album: AlbumSummary | null;
  createdAt: string;
};

/** The moments guests can choose when uploading. Each becomes an Album row. */
export const galleryMoments = [
  { name: "Getting Ready", slug: "getting-ready" },
  { name: "Ceremony", slug: "ceremony" },
  { name: "Reception", slug: "reception" },
  { name: "Dance Floor", slug: "dance-floor" },
] as const;

export type MomentSlug = (typeof galleryMoments)[number]["slug"];

export function isMomentSlug(value: unknown): value is MomentSlug {
  return galleryMoments.some((moment) => moment.slug === value);
}

export const GALLERY_PAGE_SIZE = 24;

/**
 * Insert a Cloudinary transformation into a delivery URL, e.g.
 * .../image/upload/v123/wedding/abc.jpg -> .../image/upload/w_400,q_auto,f_auto/v123/wedding/abc.jpg
 */
function withTransform(url: string, transform: string) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  return url.replace("/upload/", `/upload/${transform}/`);
}

/** Swap a video's file extension so Cloudinary returns a still frame instead. */
function videoPoster(url: string, transform: string) {
  return withTransform(url, `${transform},so_0`).replace(/\.[a-z0-9]+(\?.*)?$/i, ".jpg$1");
}

/** Small, fast image for grids (photos and video thumbnails alike). */
export function getThumbnailUrl(item: Pick<MediaItem, "url" | "type">) {
  const transform = "w_400,c_limit,q_auto,f_auto";
  return item.type === "VIDEO" ? videoPoster(item.url, transform) : withTransform(item.url, transform);
}

/** Larger image for the full-screen viewer. */
export function getDisplayUrl(item: Pick<MediaItem, "url" | "type">) {
  const transform = "w_1600,c_limit,q_auto,f_auto";
  return item.type === "VIDEO" ? videoPoster(item.url, transform) : withTransform(item.url, transform);
}

/**
 * Playable video for every browser. iPhones record HEVC .mov files that Chrome and
 * Android can't play, so ask Cloudinary for an H.264 .mp4 at automatic quality.
 */
export function getVideoUrl(item: Pick<MediaItem, "url">) {
  return withTransform(item.url, "q_auto,vc_h264").replace(/\.[a-z0-9]+(\?.*)?$/i, ".mp4$1");
}
