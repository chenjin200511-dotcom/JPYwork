// Purpose: Adds an internal note to an order activity timeline.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { messageNoteSchema } from "@/lib/api/schemas";
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
    const user = await requirePermission("orders.manage", "Order");
    const { id } = await context.params;
    const payload = await parseJsonBody(request, messageNoteSchema);
    await prisma.order.findUniqueOrThrow({ where: { id } });
    const activity = await writeActivity({
      action: "note",
      content: payload.content,
      entityId: id,
      entityType: "Order",
      userId: user.id,
    });

    return apiSuccess({ activity });
  } catch (error) {
    return handleApiError(error);
  }
}
