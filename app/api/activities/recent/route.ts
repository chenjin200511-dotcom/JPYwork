// Purpose: Returns recent activity timeline entries for the dashboard.
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { serializeActivity } from "@/lib/api/serializers";
import { requireUser } from "@/lib/api/authGuard";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireUser();
    const activities = await prisma.activity.findMany({
      include: {
        user: { select: { email: true, id: true, name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    return apiSuccess({ activities: activities.map(serializeActivity) });
  } catch (error) {
    return handleApiError(error);
  }
}
