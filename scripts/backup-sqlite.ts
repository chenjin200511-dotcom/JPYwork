// Purpose: Runs before local Next.js service startup to preserve the SQLite dev database.
import "dotenv/config";
import { backupSqliteDatabase } from "../lib/db/sqliteBackup";

const connectionString =
  process.env.DATABASE_URL ?? process.env.SQLITE_DATABASE_URL ?? "";

const result = backupSqliteDatabase(connectionString);

if (result.copied) {
  console.log("SQLite backup created: prisma/dev.db.backup");
} else if (result.reason === "missing-source") {
  console.log("SQLite backup skipped: database file does not exist yet.");
} else if (result.reason === "non-sqlite") {
  console.log("SQLite backup skipped: active database is not SQLite.");
}
