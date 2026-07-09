// Purpose: Verifies SQLite startup backup helpers protect the local dev database.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  backupSqliteDatabase,
  resolveSqliteFilePath,
} from "./sqliteBackup";

test("resolves relative SQLite file URLs from the project directory", () => {
  const cwd = path.join(os.tmpdir(), "jpy-sqlite-resolve");
  assert.equal(
    resolveSqliteFilePath("file:./prisma/dev.db", cwd),
    path.join(cwd, "prisma", "dev.db"),
  );
});

test("copies dev.db to dev.db.backup", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "jpy-sqlite-backup-"));
  const prismaDir = path.join(tempDir, "prisma");
  fs.mkdirSync(prismaDir);
  const dbPath = path.join(prismaDir, "dev.db");
  fs.writeFileSync(dbPath, "local sqlite bytes");

  const result = backupSqliteDatabase("file:./prisma/dev.db", tempDir);

  assert.equal(result.copied, true);
  assert.equal(result.sourcePath, dbPath);
  assert.equal(result.backupPath, `${dbPath}.backup`);
  assert.equal(fs.readFileSync(`${dbPath}.backup`, "utf8"), "local sqlite bytes");
});

test("skips non-SQLite database URLs without exposing the URL", () => {
  const result = backupSqliteDatabase("postgresql://user:pass@localhost/db");

  assert.deepEqual(result, {
    copied: false,
    reason: "non-sqlite",
  });
});
