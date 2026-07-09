// Purpose: Rejects an owner approval request and updates related pricing when known.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { approvalDecisionSchema } from "@/lib/api/schemas";
import { serializeApproval } from "@/lib/api/serializers";
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
    const user = await requirePermission("approval.decide", "Approval");
    const { id } = await context.params;
    const payload = await parseJsonBody(request, approvalDecisionSchema);
    const approval = await prisma.approval.update({
      data: {
        approverId: user.id,
        decisionNote: payload.decisionNote ?? null,
        status: "REJECTED",
      },
      where: { id },
    });

    if (approval.relatedType === "PricingRule" && approval.relatedId) {
      await prisma.pricingRule.update({
        data: { status: "REJECTED" },
        where: { id: approval.relatedId },
      });
    }

    await writeActivity({
      action: "reject",
      content: payload.decisionNote || `审批驳回：${approval.title}`,
      entityId: approval.id,
      entityType: "Approval",
      userId: user.id,
    });

    return apiSuccess({ approval: serializeApproval(approval) });
  } catch (error) {
    return handleApiError(error);
  }
}
