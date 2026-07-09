// Purpose: Configures local SQLite Prisma fallback when Docker/PostgreSQL is unavailable.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.sqlite.prisma",
  migrations: {
    path: "prisma/migrations-sqlite",
    seed: "tsx prisma/seed.ts --sqlite",
  },
  datasource: {
    url: process.env.SQLITE_DATABASE_URL ?? "file:./prisma/dev.db",
  },
});
