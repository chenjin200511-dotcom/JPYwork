// Purpose: Approves an owner approval request and updates related object status when known.
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

async function syncRelatedApproval(relatedType: string | null, relatedId: string | null) {
  if (!relatedType || !relatedId) {
    return;
  }

  if (relatedType === "PricingRule") {
    await prisma.pricingRule.update({
      data: { status: "APPROVED" },
      where: { id: relatedId },
    });
  }

  if (relatedType === "CustomerMessage") {
    await prisma.customerMessage.update({
      data: { status: "IN_PROGRESS" },
      where: { id: relatedId },
    });
  }

  if (relatedType === "Listing") {
    await prisma.listing.update({
      data: { status: "READY_TO_PUBLISH" },
      where: { id: relatedId },
    });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requirePermission("approval.decide", "Approval");
    const { id } = await context.params;
    const payload = await parseJsonBody(request, approvalDecisionSchema);
    const approval = await prisma.approval.update({
      data: {
        approverId: user.id,
        decisionNote: payload.decisionNote ?? null,
        status: "APPROVED",
      },
      where: { id },
    });
    await syncRelatedApproval(approval.relatedType, approval.relatedId);
    await writeActivity({
      action: "approve",
      content: payload.decisionNote || `审批通过：${approval.title}`,
      entityId: approval.id,
      entityType: "Approval",
      userId: user.id,
    });

    return apiSuccess({ approval: serializeApproval(approval) });
  } catch (error) {
    return handleApiError(error);
  }
}
