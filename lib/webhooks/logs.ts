// Purpose: Stores lightweight webhook ingestion logs in AuditLog without adding MVP schema weight.
import type { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import { prisma } from "@/lib/db/prisma";

export type WebhookLogStatus = "FAILED" | "SUCCESS";
export type WebhookLogTarget = "inventory" | "listings" | "orders";

type WebhookLogInput = {
  externalId?: string | null;
  message?: string;
  reason?: string;
  recordId?: string | null;
  request?: NextRequest;
  source?: string | null;
  status: WebhookLogStatus;
  target: WebhookLogTarget;
};

export type WebhookLogRecord = {
  action: string;
  createdAt: string;
  externalId: string | null;
  id: string;
  message: string;
  reason: string;
  recordId: string | null;
  source: string | null;
  status: WebhookLogStatus;
  target: WebhookLogTarget;
};

function logAction(input: Pick<WebhookLogInput, "status" | "target">) {
  return `webhook.${input.target}.${input.status === "SUCCESS" ? "success" : "failed"}`;
}

function plainMetadata(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeLog(record: {
  action: string;
  createdAt: Date;
  entityId: string | null;
  id: string;
  metadata: unknown;
}): WebhookLogRecord {
  const metadata = plainMetadata(record.metadata);
  const status = record.action.endsWith(".success") ? "SUCCESS" : "FAILED";
  const target = String(metadata.target ?? "orders") as WebhookLogTarget;

  return {
    action: record.action,
    createdAt: record.createdAt.toISOString(),
    externalId: typeof metadata.externalId === "string" ? metadata.externalId : null,
    id: record.id,
    message: typeof metadata.message === "string" ? metadata.message : "",
    reason: typeof metadata.reason === "string" ? metadata.reason : "",
    recordId: record.entityId,
    source: typeof metadata.source === "string" ? metadata.source : null,
    status,
    target,
  };
}

export function getWebhookErrorInfo(error: unknown) {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      reason: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      reason: "WEBHOOK_REQUEST_FAILED",
    };
  }

  return {
    message: "Webhook request failed",
    reason: "WEBHOOK_REQUEST_FAILED",
  };
}

export async function recordWebhookLog(input: WebhookLogInput) {
  try {
    await writeAuditLog({
      action: logAction(input),
      entityId: input.recordId ?? null,
      entityType: "WebhookIngestion",
      metadata: {
        externalId: input.externalId ?? null,
        message: input.message ?? "",
        reason: input.reason ?? "",
        source: input.source ?? null,
        status: input.status,
        target: input.target,
      },
      request: input.request,
    });
  } catch (error) {
    console.error("Failed to write webhook log", error);
  }
}

export async function getWebhookLogSummary() {
  const [successCount, failureCount, latestSuccess, latestFailure] = await Promise.all([
    prisma.auditLog.count({
      where: { action: { endsWith: ".success" }, entityType: "WebhookIngestion" },
    }),
    prisma.auditLog.count({
      where: { action: { endsWith: ".failed" }, entityType: "WebhookIngestion" },
    }),
    prisma.auditLog.findFirst({
      orderBy: { createdAt: "desc" },
      where: { action: { endsWith: ".success" }, entityType: "WebhookIngestion" },
    }),
    prisma.auditLog.findFirst({
      orderBy: { createdAt: "desc" },
      where: { action: { endsWith: ".failed" }, entityType: "WebhookIngestion" },
    }),
  ]);

  return {
    failureCount,
    lastFailureAt: latestFailure?.createdAt.toISOString() ?? null,
    lastSuccessAt: latestSuccess?.createdAt.toISOString() ?? null,
    successCount,
  };
}

export async function listWebhookLogs(input: {
  page: number;
  pageSize: number;
  status?: WebhookLogStatus;
}) {
  const statusWhere =
    input.status === "SUCCESS"
      ? { endsWith: ".success" }
      : input.status === "FAILED"
        ? { endsWith: ".failed" }
        : undefined;
  const where = {
    entityType: "WebhookIngestion",
    ...(statusWhere ? { action: statusWhere } : {}),
  };
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      where,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs: logs.map(normalizeLog),
    total,
  };
}
