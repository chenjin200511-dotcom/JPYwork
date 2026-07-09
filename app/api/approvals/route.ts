// Purpose: Lists and creates owner approval requests.
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { handleApiError } from "@/lib/api/errors";
import { getPagination, paginationMeta } from "@/lib/api/pagination";
import { apiSuccess } from "@/lib/api/response";
import { approvalListQuerySchema, createApprovalSchema } from "@/lib/api/schemas";
import { serializeApproval } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody, parseSearchParams } from "@/lib/api/validate";
import { prisma } from "@/lib/db/prisma";
import { writeActivity } from "@/lib/workspace/activity";

export const runtime = "nodejs";

function approvalWhere(query: ReturnType<typeof approvalListQuerySchema.parse>): Prisma.ApprovalWhereInput {
  return {
    requestedById: query.requestedById,
    status: query.status,
    type: query.type,
    OR: query.search
      ? [{ title: { contains: query.search } }, { description: { contains: query.search } }]
      : undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    await requirePermission("approval.view", "Approval");
    const query = parseSearchParams(request.url, approvalListQuerySchema);
    const where = approvalWhere(query);
    const { skip, take } = getPagination(query.page, query.pageSize);
    const [approvals, total] = await Promise.all([
      prisma.approval.findMany({
        include: {
          approver: { select: { email: true, id: true, name: true, role: true } },
          requestedBy: { select: { email: true, id: true, name: true, role: true } },
        },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        skip,
        take,
        where,
      }),
      prisma.approval.count({ where }),
    ]);

    return apiSuccess({
      ...paginationMeta({ page: query.page, pageSize: query.pageSize, total }),
      approvals: approvals.map(serializeApproval),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission("approval.view", "Approval");
    const payload = await parseJsonBody(request, createApprovalSchema);
    const approval = await prisma.approval.create({
      data: {
        ...payload,
        requestedById: payload.requestedById ?? user.id,
      },
    });
    await writeActivity({
      action: "create",
      content: `创建审批：${approval.title}`,
      entityId: approval.id,
      entityType: "Approval",
      userId: user.id,
    });

    return apiSuccess({ approval: serializeApproval(approval) });
  } catch (error) {
    return handleApiError(error);
  }
}
