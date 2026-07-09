// Purpose: Creates the local SQLite fallback schema when Docker/PostgreSQL is unavailable.
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

function sqlitePathFromUrl(url: string) {
  if (!url.startsWith("file:")) {
    throw new Error("SQLite init requires a file: database URL.");
  }

  const rawPath = url.replace(/^file:/, "");
  return path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
}

const databaseUrl =
  process.env.SQLITE_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "file:./prisma/dev.db";
const databasePath = sqlitePathFromUrl(databaseUrl);

fs.mkdirSync(path.dirname(databasePath), {
  recursive: true,
});

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "expiresAt" DATETIME NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Session_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ContentVersion" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "key" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "contentJson" JSONB NOT NULL,
  "version" INTEGER NOT NULL,
  "createdBy" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContentVersion_createdBy_fkey"
    FOREIGN KEY ("createdBy") REFERENCES "User" ("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Task" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'TODO',
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "assigneeId" TEXT,
  "platform" TEXT NOT NULL DEFAULT 'INTERNAL',
  "dueAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Task_assigneeId_fkey"
    FOREIGN KEY ("assigneeId") REFERENCES "User" ("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Order" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "platform" TEXT NOT NULL,
  "externalOrderId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "skuCount" INTEGER NOT NULL DEFAULT 0,
  "estimatedProfit" DECIMAL,
  "riskFlags" JSONB NOT NULL DEFAULT '[]',
  "ownerId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Order_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User" ("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "PricingRule" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sku" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  "cost" DECIMAL NOT NULL,
  "shippingCost" DECIMAL NOT NULL,
  "platformFeeRate" DECIMAL NOT NULL,
  "paymentFeeRate" DECIMAL NOT NULL,
  "exchangeRate" DECIMAL NOT NULL,
  "taxReserveRate" DECIMAL NOT NULL,
  "targetMarginRate" DECIMAL NOT NULL,
  "suggestedPrice" DECIMAL NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdBy" TEXT,
  "approvedBy" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PricingRule_createdBy_fkey"
    FOREIGN KEY ("createdBy") REFERENCES "User" ("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "PricingRule_approvedBy_fkey"
    FOREIGN KEY ("approvedBy") REFERENCES "User" ("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ApiConnection" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "provider" TEXT NOT NULL UNIQUE,
  "status" TEXT NOT NULL DEFAULT 'RESERVED',
  "displayName" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  "ip" TEXT,
  "userAgent" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User" ("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE INDEX IF NOT EXISTS "ContentVersion_key_language_version_idx" ON "ContentVersion"("key", "language", "version");
CREATE INDEX IF NOT EXISTS "Task_status_platform_idx" ON "Task"("status", "platform");
CREATE INDEX IF NOT EXISTS "Task_assigneeId_idx" ON "Task"("assigneeId");
CREATE UNIQUE INDEX IF NOT EXISTS "Order_platform_externalOrderId_key" ON "Order"("platform", "externalOrderId");
CREATE INDEX IF NOT EXISTS "Order_status_platform_idx" ON "Order"("status", "platform");
CREATE INDEX IF NOT EXISTS "PricingRule_sku_idx" ON "PricingRule"("sku");
CREATE INDEX IF NOT EXISTS "PricingRule_status_idx" ON "PricingRule"("status");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_action_entityType_idx" ON "AuditLog"("action", "entityType");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
`);

db.close();

console.log(`SQLite fallback database is ready: ${databasePath}`);
