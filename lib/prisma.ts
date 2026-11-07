import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  }

  const isLocal = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(new URL(url).hostname);
  const adapter = new PrismaPg({
    connectionString: url,
    max: 5,
    // Hosted databases require an encrypted connection. Providers whose certificate isn't
    // publicly trusted give you a CA file: paste it into DATABASE_CA_CERT.
    ssl: isLocal ? false : { rejectUnauthorized: true, ca: process.env.DATABASE_CA_CERT?.replace(/\n/g, "\n") || undefined },
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
