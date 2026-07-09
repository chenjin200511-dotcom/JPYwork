// Purpose: Reads or updates one customer message.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { patchMessageSchema } from "@/lib/api/schemas";
import { serializeMessage } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody } from "@/lib/api/validate";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import { prisma } from "@/lib/db/prisma";
import { writeActivity } from "@/lib/workspace/activity";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requirePermission("messages.view", "Message");
    const { id } = await context.params;
    const message = await prisma.customerMessage.findUnique({
      include: {
        assignee: { select: { email: true, id: true, name: true, role: true } },
        relatedOrder: true,
      },
      where: { id },
    });

    return apiSuccess({ message: message ? serializeMessage(message) : null });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requirePermission("messages.manage", "Message");
    const { id } = await context.params;
    const payload = await parseJsonBody(request, patchMessageSchema);
    const message = await prisma.customerMessage.update({
      data: {
        ...payload,
        dueAt: payload.dueAt ? new Date(payload.dueAt) : payload.dueAt,
        lastReplyAt: payload.lastReplyAt ? new Date(payload.lastReplyAt) : payload.lastReplyAt,
      },
      where: { id },
    });

    await writeActivity({
      action: "update",
      content: `更新客服消息：${message.subject}`,
      entityId: message.id,
      entityType: "CustomerMessage",
      userId: user.id,
    });
    await writeAuditLog({
      action: "message.update",
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
