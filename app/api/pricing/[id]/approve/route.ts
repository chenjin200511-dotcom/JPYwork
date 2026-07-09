// Purpose: Approves one pricing rule with OWNER-only permission.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { pricingDecisionSchema } from "@/lib/api/schemas";
import { serializePricingRule } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody } from "@/lib/api/validate";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import { prisma } from "@/lib/db/prisma";
import { writeActivity } from "@/lib/workspace/activity";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requirePermission("pricing.approve", "PricingRule");
    const { id } = await context.params;
    const payload = await parseJsonBody(request, pricingDecisionSchema);
    const pricingRule = await prisma.pricingRule.update({
      data: {
        approvedById: user.id,
        status: "APPROVED",
      },
      where: { id },
    });

    await prisma.approval.updateMany({
      data: { decisionNote: payload.note ?? null, status: "APPROVED" },
      where: { relatedId: id, relatedType: "PricingRule", status: "PENDING" },
    });
    await writeActivity({
      action: "approve",
      content: payload.note || `审批通过定价：${pricingRule.productName}`,
      entityId: pricingRule.id,
      entityType: "PricingRule",
      userId: user.id,
    });
    await writeAuditLog({
      action: "pricing_rule.approve",
      entityId: pricingRule.id,
      entityType: "PricingRule",
      request,
      userId: user.id,
    });

    return apiSuccess({ pricingRule: serializePricingRule(pricingRule) });
  } catch (error) {
    return handleApiError(error);
  }
}
