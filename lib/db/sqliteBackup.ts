// Purpose: Creates a lightweight local SQLite backup before the app starts using dev data.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type SqliteBackupResult = {
  backupPath?: string;
  copied: boolean;
  reason?: "missing-source" | "non-sqlite" | "already-backed-up";
  sourcePath?: string;
};

const globalForBackup = globalThis as unknown as {
  sqliteBackupPaths?: Set<string>;
};

export function resolveSqliteFilePath(connectionString: string, cwd = process.cwd()) {
  if (!connectionString.startsWith("file:")) {
    return null;
  }

  if (connectionString.startsWith("file://")) {
    return fileURLToPath(connectionString);
  }

  const rawPath = connectionString.slice("file:".length);
  return path.isAbsolute(rawPath) ? rawPath : path.resolve(cwd, rawPath);
}

export function backupSqliteDatabase(
  connectionString: string,
  cwd = process.cwd(),
): SqliteBackupResult {
  const sourcePath = resolveSqliteFilePath(connectionString, cwd);

  if (!sourcePath) {
    return { copied: false, reason: "non-sqlite" };
  }

  if (!fs.existsSync(sourcePath)) {
    return { copied: false, reason: "missing-source", sourcePath };
  }

  const backupPath = `${sourcePath}.backup`;
  fs.copyFileSync(sourcePath, backupPath);

  return {
    backupPath,
    copied: true,
    sourcePath,
  };
}

export function backupSqliteDatabaseOnce(
  connectionString: string,
  cwd = process.cwd(),
): SqliteBackupResult {
  const sourcePath = resolveSqliteFilePath(connectionString, cwd);

  if (!sourcePath) {
    return { copied: false, reason: "non-sqlite" };
  }

  globalForBackup.sqliteBackupPaths ??= new Set<string>();

  if (globalForBackup.sqliteBackupPaths.has(sourcePath)) {
    return {
      backupPath: `${sourcePath}.backup`,
      copied: false,
      reason: "already-backed-up",
      sourcePath,
    };
  }

  const result = backupSqliteDatabase(connectionString, cwd);
  globalForBackup.sqliteBackupPaths.add(sourcePath);
  return result;
}
