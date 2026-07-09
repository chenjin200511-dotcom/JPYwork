// Purpose: Lists saved daily briefings.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { getPagination, paginationMeta } from "@/lib/api/pagination";
import { apiSuccess } from "@/lib/api/response";
import { briefingListQuerySchema } from "@/lib/api/schemas";
import { serializeBriefing } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseSearchParams } from "@/lib/api/validate";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("briefing.view", "Briefing");
    const query = parseSearchParams(request.url, briefingListQuerySchema);
    const date = query.date ? new Date(query.date) : null;
    const { skip, take } = getPagination(query.page, query.pageSize);
    const where = {
      date: date
        ? {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lt: new Date(date.setHours(24, 0, 0, 0)),
          }
        : undefined,
      type: query.type,
    };
    const [briefings, total] = await Promise.all([
      prisma.dailyBriefing.findMany({
        include: {
          creator: { select: { email: true, id: true, name: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
        where,
      }),
      prisma.dailyBriefing.count({ where }),
    ]);

    return apiSuccess({
      ...paginationMeta({ page: query.page, pageSize: query.pageSize, total }),
      briefings: briefings.map(serializeBriefing),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
