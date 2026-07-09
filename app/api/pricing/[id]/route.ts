// Purpose: Reads or updates one pricing rule by route id.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { patchPricingRuleBodySchema } from "@/lib/api/schemas";
import { serializePricingRule } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody } from "@/lib/api/validate";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import { prisma } from "@/lib/db/prisma";
import { writeActivity } from "@/lib/workspace/activity";
import { calculatePricing } from "@/lib/workspace/pricing";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requirePermission("pricing.view", "PricingRule");
    const { id } = await context.params;
    const pricingRule = await prisma.pricingRule.findUnique({
      include: {
        approver: { select: { email: true, id: true, name: true, role: true } },
        submitter: { select: { email: true, id: true, name: true, role: true } },
      },
      where: { id },
    });

    return apiSuccess({
      pricingRule: pricingRule ? serializePricingRule(pricingRule) : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requirePermission("pricing.edit", "PricingRule");
    const { id } = await context.params;
    const payload = await parseJsonBody(request, patchPricingRuleBodySchema);
    const existing = await prisma.pricingRule.findUniqueOrThrow({ where: { id } });
    const pricingInput = {
      adCost: Number(payload.adCost ?? existing.adCost),
      cost: Number(payload.cost ?? existing.cost),
      domesticShipping: Number(payload.domesticShipping ?? existing.domesticShipping),
      exchangeRate: Number(payload.exchangeRate ?? existing.exchangeRate),
      internationalShipping: Number(
        payload.internationalShipping ?? existing.internationalShipping,
      ),
      packagingCost: Number(payload.packagingCost ?? existing.packagingCost),
      paymentFeeRate: Number(payload.paymentFeeRate ?? existing.paymentFeeRate),
      platformFeeRate: Number(payload.platformFeeRate ?? existing.platformFeeRate),
      returnLossRate: Number(payload.returnLossRate ?? existing.returnLossRate),
      targetMarginRate: Number(payload.targetMarginRate ?? existing.targetMarginRate),
      taxReserveRate: Number(payload.taxReserveRate ?? existing.taxReserveRate),
    };
    const calculated = calculatePricing(pricingInput);
    const pricingRule = await prisma.pricingRule.update({
      data: {
        ...payload,
        campaignFloorPrice: payload.campaignFloorPrice ?? calculated.campaignFloorPrice,
        minimumPrice: calculated.minimumPrice,
        suggestedPrice: payload.suggestedPrice ?? calculated.suggestedPrice,
      },
      where: { id },
    });

    await writeActivity({
      action: "update",
      content: `更新定价：${pricingRule.productName}`,
      entityId: pricingRule.id,
      entityType: "PricingRule",
      userId: user.id,
    });
    await writeAuditLog({
      action: "pricing_rule.update",
      entityId: pricingRule.id,
      entityType: "PricingRule",
      request,
      userId: user.id,
    });

    return apiSuccess({
      calculated,
      pricingRule: serializePricingRule(pricingRule),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
