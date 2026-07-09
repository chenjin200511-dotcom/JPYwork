// Purpose: Provides customer message collaboration endpoints.
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { handleApiError } from "@/lib/api/errors";
import { getPagination, paginationMeta } from "@/lib/api/pagination";
import { apiSuccess } from "@/lib/api/response";
import { createMessageSchema, messageListQuerySchema } from "@/lib/api/schemas";
import { serializeMessage } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody, parseSearchParams } from "@/lib/api/validate";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import { prisma } from "@/lib/db/prisma";
import { writeActivity } from "@/lib/workspace/activity";

export const runtime = "nodejs";

function messageWhere(query: ReturnType<typeof messageListQuerySchema.parse>): Prisma.CustomerMessageWhereInput {
  return {
    assigneeId: query.assigneeId,
    platform: query.platform,
    priority: query.priority,
    status: query.status,
    OR: query.search
      ? [
          { customerName: { contains: query.search } },
          { subject: { contains: query.search } },
          { message: { contains: query.search } },
        ]
      : undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    await requirePermission("messages.view", "Message");
    const query = parseSearchParams(request.url, messageListQuerySchema);
    const where = messageWhere(query);
    const { skip, take } = getPagination(query.page, query.pageSize);
    const [messages, total] = await Promise.all([
      prisma.customerMessage.findMany({
        include: {
          assignee: { select: { email: true, id: true, name: true, role: true } },
          relatedOrder: true,
        },
        orderBy: [{ status: "asc" }, { priority: "desc" }, { updatedAt: "desc" }],
        skip,
        take,
        where,
      }),
      prisma.customerMessage.count({ where }),
    ]);

    return apiSuccess({
      ...paginationMeta({ page: query.page, pageSize: query.pageSize, total }),
      messages: messages.map(serializeMessage),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission("messages.manage", "Message");
    const payload = await parseJsonBody(request, createMessageSchema);
    const message = await prisma.customerMessage.create({
      data: {
        ...payload,
        dueAt: payload.dueAt ? new Date(payload.dueAt) : null,
        lastReplyAt: payload.lastReplyAt ? new Date(payload.lastReplyAt) : null,
      },
    });

    await writeActivity({
      action: "create",
      content: `创建客服消息：${message.subject}`,
      entityId: message.id,
      entityType: "CustomerMessage",
      userId: user.id,
    });
    await writeAuditLog({
      action: "message.create",
      entityId: message.id,
      entityType: "CustomerMessage",
      request,
      userId: user.id,
    });

    return apiSuccess({ message: serializeMessage(message) });
  } catch (error) {
    return handleApiError(error);
  }
}
