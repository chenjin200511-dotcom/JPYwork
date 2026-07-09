// Purpose: Escalates a customer message to owner approval.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { messageEscalateSchema } from "@/lib/api/schemas";
import { serializeApproval, serializeMessage } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody } from "@/lib/api/validate";
import { prisma } from "@/lib/db/prisma";
import { sendExternalNotification } from "@/lib/notifications/externalNotification";
import { writeActivity } from "@/lib/workspace/activity";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requirePermission("messages.manage", "Message");
    const { id } = await context.params;
    const payload = await parseJsonBody(request, messageEscalateSchema);
    const owner = await prisma.user.findFirst({ where: { role: "OWNER" } });
    const message = await prisma.customerMessage.update({
      data: { status: "WAITING_OWNER" },
      where: { id },
    });
    const approval = await prisma.approval.create({
      data: {
        approverId: owner?.id,
        description: payload.note ?? message.message,
        relatedId: message.id,
        relatedType: "CustomerMessage",
        requestedById: user.id,
        title: `客服升级：${message.subject}`,
        type: "MESSAGE_ESCALATION",
      },
    });
    await writeActivity({
      action: "escalate",
      content: payload.note || "升级给负责人",
      entityId: message.id,
      entityType: "CustomerMessage",
      userId: user.id,
    });
    await sendExternalNotification({
      entityId: message.id,
      entityType: "CustomerMessage",
      lines: [
        `提交人：${user.name}`,
        `客户：${message.customerName}`,
        `主题：${message.subject}`,
        `备注：${payload.note || "需要负责人查看"}`,
      ],
      title: "JPY 客服升级待处理",
    });

    return apiSuccess({
      approval: serializeApproval(approval),
      message: serializeMessage(message),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
