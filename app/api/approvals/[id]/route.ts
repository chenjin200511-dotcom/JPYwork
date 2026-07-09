// Purpose: Reads one approval request.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { serializeApproval } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requirePermission("approval.view", "Approval");
    const { id } = await context.params;
    const approval = await prisma.approval.findUnique({
      include: {
        approver: { select: { email: true, id: true, name: true, role: true } },
        requestedBy: { select: { email: true, id: true, name: true, role: true } },
      },
      where: { id },
    });

    return apiSuccess({ approval: approval ? serializeApproval(approval) : null });
  } catch (error) {
    return handleApiError(error);
  }
}
