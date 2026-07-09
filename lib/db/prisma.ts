// Purpose: Provides a singleton Prisma client for server-side database access.
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString =
    process.env.POSTGRES_DATABASE_URL ??
    process.env.DATABASE_URL ??
    process.env.SQLITE_DATABASE_URL ??
    "postgresql://missing:missing@localhost:5432/missing";

  if (connectionString.startsWith("file:")) {
    return new PrismaClient({
      adapter: new PrismaBetterSqlite3({
        url: connectionString,
      }),
    });
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
