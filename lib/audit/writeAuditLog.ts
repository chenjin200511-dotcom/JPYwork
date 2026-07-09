// Purpose: Writes audit logs without storing passwords, tokens, or API secrets.
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

type AuditInput = {
  action: string;
  entityId?: string | null;
  entityType: string;
  metadata?: Record<string, unknown> | null;
  request?: NextRequest | Request;
  userId?: string | null;
};

const sensitiveKeyPattern = /(password|token|secret|key|authorization|cookie)/i;

function sanitizeMetadata(
  metadata: Record<string, unknown> | null | undefined,
): Prisma.InputJsonValue | undefined {
  if (!metadata) {
    return undefined;
  }

  const sanitized = Object.fromEntries(
    Object.entries(metadata).filter(([key]) => !sensitiveKeyPattern.test(key)),
  );

  return JSON.parse(JSON.stringify(sanitized)) as Prisma.InputJsonValue;
}

export async function writeAuditLog(input: AuditInput) {
  const headers = input.request?.headers;
  const metadata = sanitizeMetadata(input.metadata);

  await prisma.auditLog.create({
    data: {
      action: input.action,
      entityId: input.entityId ?? null,
      entityType: input.entityType,
      ip: headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      metadata,
      userAgent: headers?.get("user-agent") ?? null,
      userId: input.userId ?? null,
    },
  });
}
