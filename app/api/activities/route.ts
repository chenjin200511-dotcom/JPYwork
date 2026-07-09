// Purpose: Provides activity timeline list and manual note creation.
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { handleApiError } from "@/lib/api/errors";
import { getPagination, paginationMeta } from "@/lib/api/pagination";
import { apiSuccess } from "@/lib/api/response";
import { activityListQuerySchema, createActivitySchema } from "@/lib/api/schemas";
import { serializeActivity } from "@/lib/api/serializers";
import { requireUser } from "@/lib/api/authGuard";
import { parseJsonBody, parseSearchParams } from "@/lib/api/validate";
import { prisma } from "@/lib/db/prisma";
import { writeActivity } from "@/lib/workspace/activity";

export const runtime = "nodejs";

function activityWhere(query: ReturnType<typeof activityListQuerySchema.parse>): Prisma.ActivityWhereInput {
  return {
    entityId: query.entityId,
    entityType: query.entityType,
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const query = parseSearchParams(request.url, activityListQuerySchema);
    const where = activityWhere(query);
    const { skip, take } = getPagination(query.page, query.pageSize);
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        include: {
          user: { select: { email: true, id: true, name: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
        where,
      }),
      prisma.activity.count({ where }),
    ]);

    return apiSuccess({
      ...paginationMeta({ page: query.page, pageSize: query.pageSize, total }),
      activities: activities.map(serializeActivity),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const payload = await parseJsonBody(request, createActivitySchema);
    const activity = await writeActivity({
      ...payload,
      userId: user.id,
    });

    return apiSuccess({ activity: serializeActivity(activity) });
  } catch (error) {
    return handleApiError(error);
  }
}
