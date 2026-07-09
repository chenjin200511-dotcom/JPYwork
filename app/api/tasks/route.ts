// Purpose: Provides authenticated CRUD endpoints for workspace tasks.
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { handleApiError } from "@/lib/api/errors";
import { getPagination, paginationMeta } from "@/lib/api/pagination";
import { apiSuccess } from "@/lib/api/response";
import {
  createTaskSchema,
  deleteByIdSchema,
  taskListQuerySchema,
  updateTaskSchema,
} from "@/lib/api/schemas";
import { serializeTask } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody, parseSearchParams } from "@/lib/api/validate";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import { prisma } from "@/lib/db/prisma";
import { writeActivity } from "@/lib/workspace/activity";

export const runtime = "nodejs";

function taskWhere(
  query: ReturnType<typeof taskListQuerySchema.parse>,
  user: { id: string; role: string },
): Prisma.TaskWhereInput {
  const assigneeId = query.mine || user.role === "SUPPORT" ? user.id : query.assigneeId;

  return {
    assigneeId,
    platform: query.platform,
    priority: query.priority,
    status: query.status,
    OR: query.search
      ? [
          { title: { contains: query.search } },
          { description: { contains: query.search } },
          { relatedType: { contains: query.search } },
        ]
      : undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission("tasks.view", "Task");
    const query = parseSearchParams(request.url, taskListQuerySchema);
    const where = taskWhere(query, user);
    const { skip, take } = getPagination(query.page, query.pageSize);
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        include: {
          assignee: {
            select: { email: true, id: true, name: true, role: true },
          },
          creator: {
            select: { email: true, id: true, name: true, role: true },
          },
        },
        orderBy: [{ status: "asc" }, { priority: "desc" }, { updatedAt: "desc" }],
        skip,
        take,
        where,
      }),
      prisma.task.count({ where }),
    ]);

    return apiSuccess({
      ...paginationMeta({ page: query.page, pageSize: query.pageSize, total }),
      tasks: tasks.map(serializeTask),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission("tasks.manage", "Task");
    const payload = await parseJsonBody(request, createTaskSchema);
    const task = await prisma.task.create({
      data: {
        ...payload,
        completedAt: payload.status === "DONE" ? new Date() : null,
        createdById: user.id,
        dueAt: payload.dueAt ? new Date(payload.dueAt) : null,
      },
    });

    await writeActivity({
      action: "create",
      content: `创建任务：${task.title}`,
      entityId: task.id,
      entityType: "Task",
      userId: user.id,
    });
    await writeAuditLog({
      action: "task.create",
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

export async function PATCH(request: NextRequest) {
  try {
    const user = await requirePermission("tasks.manage", "Task");
    const payload = await parseJsonBody(request, updateTaskSchema);
    const { id, ...data } = payload;
    const task = await prisma.task.update({
      data: {
        ...data,
        completedAt: data.status === "DONE" ? new Date() : undefined,
        dueAt: data.dueAt ? new Date(data.dueAt) : data.dueAt,
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

export async function DELETE(request: NextRequest) {
  try {
    const user = await requirePermission("tasks.manage", "Task");
    const payload = await parseJsonBody(request, deleteByIdSchema);
    await prisma.task.delete({ where: { id: payload.id } });
    await writeActivity({
      action: "delete",
      content: "删除任务",
      entityId: payload.id,
      entityType: "Task",
      userId: user.id,
    });
    await writeAuditLog({
      action: "task.delete",
      entityId: payload.id,
      entityType: "Task",
      request,
      userId: user.id,
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
