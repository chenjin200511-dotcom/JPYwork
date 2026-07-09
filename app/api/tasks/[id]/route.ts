// Purpose: Reads, updates, or deletes one workspace task by route id.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { patchTaskBodySchema } from "@/lib/api/schemas";
import { serializeTask } from "@/lib/api/serializers";
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
    await requirePermission("tasks.view", "Task");
    const { id } = await context.params;
    const task = await prisma.task.findUnique({
      include: {
        assignee: { select: { email: true, id: true, name: true, role: true } },
        creator: { select: { email: true, id: true, name: true, role: true } },
      },
      where: { id },
    });

    return apiSuccess({ task: task ? serializeTask(task) : null });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requirePermission("tasks.manage", "Task");
    const { id } = await context.params;
    const payload = await parseJsonBody(request, patchTaskBodySchema);
    const task = await prisma.task.update({
      data: {
        ...payload,
        completedAt: payload.status === "DONE" ? new Date() : undefined,
        dueAt: payload.dueAt ? new Date(payload.dueAt) : payload.dueAt,
      },
      where: { id },
    });

    await writeActivity({
      action: "update",
      content: `更新任务：${task.title}`,
      entityId: task.id,
      entityType: "Task",
      userId: user.id,
    });
    await writeAuditLog({
      action: "task.update",
      entityId: task.id,
      entityType: "Task",
      request,
      userId: user.id,
    });

    return apiSuccess({ task: serializeTask(task) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requirePermission("tasks.manage", "Task");
    const { id } = await context.params;
    await prisma.task.delete({ where: { id } });
    await writeActivity({
      action: "delete",
      content: "删除任务",
      entityId: id,
      entityType: "Task",
      userId: user.id,
    });
    await writeAuditLog({
      action: "task.delete",
      entityId: id,
      entityType: "Task",
      request,
      userId: user.id,
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
