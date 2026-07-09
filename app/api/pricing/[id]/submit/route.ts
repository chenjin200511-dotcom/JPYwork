// Purpose: Submits one pricing rule for owner approval.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { pricingDecisionSchema } from "@/lib/api/schemas";
import { serializeApproval, serializePricingRule } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody } from "@/lib/api/validate";
import { prisma } from "@/lib/db/prisma";
import { sendExternalNotification } from "@/lib/notifications/externalNotification";
import { writeActivity } from "@/lib/workspace/activity";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requirePermission("pricing.edit", "PricingRule");
    const { id } = await context.params;
    const payload = await parseJsonBody(request, pricingDecisionSchema);
    const owner = await prisma.user.findFirst({ where: { role: "OWNER" } });
    const pricingRule = await prisma.pricingRule.update({
      data: { status: "PENDING_APPROVAL", submittedById: user.id },
      where: { id },
    });
    const approval = await prisma.approval.create({
      data: {
        approverId: owner?.id,
        description: payload.note ?? `复核 ${pricingRule.sku} 的定价申请。`,
        relatedId: pricingRule.id,
        relatedType: "PricingRule",
        requestedById: user.id,
        title: `定价审批：${pricingRule.productName}`,
        type: "PRICING",
      },
    });

    await writeActivity({
      action: "submit",
      content: payload.note || `提交定价审批：${pricingRule.productName}`,
      entityId: pricingRule.id,
      entityType: "PricingRule",
      userId: user.id,
    });
    await sendExternalNotification({
      entityId: pricingRule.id,
      entityType: "PricingRule",
      lines: [
        `提交人：${user.name}`,
        `SKU：${pricingRule.sku}`,
        `商品：${pricingRule.productName}`,
        `建议售价：${pricingRule.suggestedPrice}`,
      ],
      title: "JPY 定价审批待处理",
    });

    return apiSuccess({
      approval: serializeApproval(approval),
      pricingRule: serializePricingRule(pricingRule),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
