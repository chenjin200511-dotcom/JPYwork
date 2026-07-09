// Purpose: Configures Prisma CLI paths, migrations, seed script, and database URL for Prisma 7.
import "dotenv/config";
import { defineConfig } from "prisma/config";

const fallbackBuildDatabaseUrl =
  "postgresql://jpy_user:jpy_password@localhost:5432/jpy_team_workspace?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url:
      process.env.POSTGRES_DATABASE_URL ??
      process.env.DATABASE_URL ??
      fallbackBuildDatabaseUrl,
  },
});
