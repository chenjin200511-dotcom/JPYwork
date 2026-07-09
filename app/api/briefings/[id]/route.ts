// Purpose: Reads or edits one saved daily briefing.
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { updateBriefingSchema } from "@/lib/api/schemas";
import { serializeBriefing } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody } from "@/lib/api/validate";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requirePermission("briefing.view", "Briefing");
    const { id } = await context.params;
    const briefing = await prisma.dailyBriefing.findUnique({
      include: {
        creator: { select: { email: true, id: true, name: true, role: true } },
      },
      where: { id },
    });

    return apiSuccess({ briefing: briefing ? serializeBriefing(briefing) : null });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requirePermission("briefing.manage", "Briefing");
    const { id } = await context.params;
    const payload = await parseJsonBody(request, updateBriefingSchema);
    const briefing = await prisma.dailyBriefing.update({
      data: {
        contentJson: payload.contentJson as Prisma.InputJsonValue,
      },
      where: { id },
    });

    return apiSuccess({ briefing: serializeBriefing(briefing) });
  } catch (error) {
    return handleApiError(error);
  }
}
