// Purpose: Creates a task linked to one order.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { createTaskSchema } from "@/lib/api/schemas";
import { serializeTask } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody } from "@/lib/api/validate";
import { prisma } from "@/lib/db/prisma";
import { writeActivity } from "@/lib/workspace/activity";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requirePermission("tasks.manage", "Task");
    const { id } = await context.params;
    const order = await prisma.order.findUniqueOrThrow({ where: { id } });
    const payload = await parseJsonBody(request, createTaskSchema);
    const task = await prisma.task.create({
      data: {
        ...payload,
        createdById: user.id,
        dueAt: payload.dueAt ? new Date(payload.dueAt) : null,
        relatedId: order.id,
        relatedType: "Order",
      },
    });
    await writeActivity({
      action: "create-task",
      content: `从订单 ${order.externalOrderId} 创建任务：${task.title}`,
      entityId: order.id,
      entityType: "Order",
      userId: user.id,
    });

    return apiSuccess({ task: serializeTask(task) });
  } catch (error) {
    return handleApiError(error);
  }
}
