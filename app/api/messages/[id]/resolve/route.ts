// Purpose: Marks a customer message as resolved.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { serializeMessage } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { prisma } from "@/lib/db/prisma";
import { writeActivity } from "@/lib/workspace/activity";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requirePermission("messages.manage", "Message");
    const { id } = await context.params;
    const message = await prisma.customerMessage.update({
      data: { lastReplyAt: new Date(), status: "RESOLVED" },
      where: { id },
    });
    await writeActivity({
      action: "resolve",
      content: `标记已解决：${message.subject}`,
      entityId: message.id,
      entityType: "CustomerMessage",
      userId: user.id,
    });

    return apiSuccess({ message: serializeMessage(message) });
  } catch (error) {
    return handleApiError(error);
  }
}
