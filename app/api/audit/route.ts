// Purpose: Lists audit logs for owner review.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { getPagination, paginationMeta } from "@/lib/api/pagination";
import { apiSuccess } from "@/lib/api/response";
import { paginationQuerySchema } from "@/lib/api/schemas";
import { serializeAuditLog } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseSearchParams } from "@/lib/api/validate";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("audit.view", "AuditLog");
    const query = parseSearchParams(request.url, paginationQuerySchema);
    const { skip, take } = getPagination(query.page, query.pageSize);
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        include: {
          user: { select: { email: true, id: true, name: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.auditLog.count(),
    ]);

    return apiSuccess({
      ...paginationMeta({ page: query.page, pageSize: query.pageSize, total }),
      logs: logs.map(serializeAuditLog),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
