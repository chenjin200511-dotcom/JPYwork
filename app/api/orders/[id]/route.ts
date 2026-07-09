// Purpose: Reads or updates one order risk record by route id.
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { patchOrderBodySchema } from "@/lib/api/schemas";
import { serializeOrder } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody } from "@/lib/api/validate";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import { prisma } from "@/lib/db/prisma";
import {
  isOrderRiskSignal,
  sendExternalNotification,
} from "@/lib/notifications/externalNotification";
import { writeActivity } from "@/lib/workspace/activity";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requirePermission("orders.view", "Order");
    const { id } = await context.params;
    const order = await prisma.order.findUnique({
      include: {
        assignee: { select: { email: true, id: true, name: true, role: true } },
        messages: true,
      },
      where: { id },
    });

    return apiSuccess({ order: order ? serializeOrder(order) : null });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requirePermission("orders.manage", "Order");
    const { id } = await context.params;
    const payload = await parseJsonBody(request, patchOrderBodySchema);
    const { riskFlags, ...data } = payload;
    const order = await prisma.order.update({
      data: {
        ...data,
        riskFlags: riskFlags as Prisma.InputJsonValue | undefined,
      },
      where: { id },
    });

    await writeActivity({
      action: "update",
      content: `更新订单：${order.externalOrderId}`,
      entityId: order.id,
      entityType: "Order",
      userId: user.id,
    });
    await writeAuditLog({
      action: "order.update",
      entityId: order.id,
      entityType: "Order",
      request,
      userId: user.id,
    });
    if (isOrderRiskSignal({ riskLevel: order.riskLevel, status: order.status })) {
      await sendExternalNotification({
        entityId: order.id,
        entityType: "Order",
        lines: [
          `提交人：${user.name}`,
          `订单：${order.externalOrderId}`,
          `状态：${order.status}`,
          `风险：${order.riskLevel}`,
        ],
        title: "JPY 订单风险待处理",
      });
    }

    return apiSuccess({ order: serializeOrder(order) });
  } catch (error) {
    return handleApiError(error);
  }
}
