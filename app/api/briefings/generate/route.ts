// Purpose: Generates and saves a rule-based daily briefing.
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { generateBriefingSchema } from "@/lib/api/schemas";
import { serializeBriefing } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody } from "@/lib/api/validate";
import { prisma } from "@/lib/db/prisma";
import { generateBriefingContent } from "@/lib/workspace/briefing";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission("briefing.manage", "Briefing");
    const payload = await parseJsonBody(request, generateBriefingSchema);
    const date = payload.date ? new Date(payload.date) : new Date();
    const content = await generateBriefingContent(date, payload.type);
    const briefing = await prisma.dailyBriefing.create({
      data: {
        contentJson: content as Prisma.InputJsonValue,
        createdById: user.id,
        date,
        type: payload.type,
      },
    });

    return apiSuccess({ briefing: serializeBriefing(briefing) });
  } catch (error) {
    return handleApiError(error);
  }
}
