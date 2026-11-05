import type { NextConfig } from "next";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

const nextConfig: NextConfig = {
  // Let phones on the same Wi-Fi (e.g. http://192.168.0.159:3001) use the dev server.
  allowedDevOrigins: ["192.168.*.*"],

  images: {
    // Only optimise images from our own Cloudinary account.
    // Object form (not `new URL`), because `new URL` pins the query string to empty.
    remotePatterns: [
      ...(cloudName ? [{ protocol: "https" as const, hostname: "res.cloudinary.com", pathname: `/${cloudName}/**` }] : []),
    ],
  },
};

export default nextConfig;
