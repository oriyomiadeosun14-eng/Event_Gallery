import "server-only";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  }

  // The MariaDB driver speaks the MySQL protocol, so it works for MySQL too.
  const parsed = new URL(url);
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  const adapter = new PrismaMariaDb({
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ""),
    connectionLimit: 5,
    // MySQL 8's default auth plugin needs this when connecting without TLS (local dev).
    allowPublicKeyRetrieval: isLocal,
    // Hosted databases require an encrypted connection. Providers whose certificate isn't
    // publicly trusted (e.g. Aiven) give you a CA file: paste it into DATABASE_CA_CERT.
    ssl: isLocal ? false : { rejectUnauthorized: true, ca: process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n") || undefined },
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
