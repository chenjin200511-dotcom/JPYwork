// Purpose: Provides authenticated CRUD endpoints for order risk workflows.
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { handleApiError } from "@/lib/api/errors";
import { getPagination, paginationMeta } from "@/lib/api/pagination";
import { apiSuccess } from "@/lib/api/response";
import {
  createOrderSchema,
  deleteByIdSchema,
  orderListQuerySchema,
  updateOrderSchema,
} from "@/lib/api/schemas";
import { serializeOrder } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody, parseSearchParams } from "@/lib/api/validate";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import { prisma } from "@/lib/db/prisma";
import {
  isOrderRiskSignal,
  sendExternalNotification,
} from "@/lib/notifications/externalNotification";
import { writeActivity } from "@/lib/workspace/activity";

export const runtime = "nodejs";

function orderWhere(query: ReturnType<typeof orderListQuerySchema.parse>): Prisma.OrderWhereInput {
  return {
    assigneeId: query.assigneeId,
    platform: query.platform,
    riskLevel: query.riskLevel,
    status: query.status,
    OR: query.search
      ? [
          { externalOrderId: { contains: query.search } },
          { customerName: { contains: query.search } },
        ]
      : undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    await requirePermission("orders.view", "Order");
    const query = parseSearchParams(request.url, orderListQuerySchema);
    const where = orderWhere(query);
    const { skip, take } = getPagination(query.page, query.pageSize);
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        include: {
          assignee: { select: { email: true, id: true, name: true, role: true } },
        },
        orderBy: [{ riskLevel: "desc" }, { updatedAt: "desc" }],
        skip,
        take,
        where,
      }),
      prisma.order.count({ where }),
    ]);

    return apiSuccess({
      ...paginationMeta({ page: query.page, pageSize: query.pageSize, total }),
      orders: orders.map(serializeOrder),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission("orders.manage", "Order");
    const payload = await parseJsonBody(request, createOrderSchema);
    const order = await prisma.order.create({
      data: {
        ...payload,
        riskFlags: payload.riskFlags as Prisma.InputJsonValue,
      },
    });

    await writeActivity({
      action: "create",
      content: `创建订单：${order.externalOrderId}`,
      entityId: order.id,
      entityType: "Order",
      userId: user.id,
    });
    await writeAuditLog({
      action: "order.create",
      entityId: order.id,
      entityType: "Order",
      request,
      userId: user.id,
    });

    return apiSuccess({ order: serializeOrder(order) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requirePermission("orders.manage", "Order");
    const payload = await parseJsonBody(request, updateOrderSchema);
    const { id, riskFlags, ...data } = payload;
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

export async function DELETE(request: NextRequest) {
  try {
    const user = await requirePermission("orders.manage", "Order");
    const payload = await parseJsonBody(request, deleteByIdSchema);
    await prisma.order.delete({ where: { id: payload.id } });
    await writeAuditLog({
      action: "order.delete",
      entityId: payload.id,
      entityType: "Order",
      request,
      userId: user.id,
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
