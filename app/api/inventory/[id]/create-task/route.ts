// Purpose: Creates a replenishment task from one inventory item.
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
    const item = await prisma.inventoryItem.findUniqueOrThrow({ where: { id } });
    const payload = await parseJsonBody(request, createTaskSchema);
    const task = await prisma.task.create({
      data: {
        ...payload,
        createdById: user.id,
        dueAt: payload.dueAt ? new Date(payload.dueAt) : null,
        relatedId: item.id,
        relatedType: "InventoryItem",
      },
    });
    await writeActivity({
      action: "create-task",
      content: `从库存预警创建任务：${task.title}`,
      entityId: item.id,
      entityType: "InventoryItem",
      userId: user.id,
    });

    return apiSuccess({ task: serializeTask(task) });
  } catch (error) {
    return handleApiError(error);
  }
}
