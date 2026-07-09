// Purpose: Creates a pricing draft from one listing.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { createPricingRuleSchema } from "@/lib/api/schemas";
import { serializePricingRule } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody } from "@/lib/api/validate";
import { prisma } from "@/lib/db/prisma";
import { writeActivity } from "@/lib/workspace/activity";
import { calculatePricing } from "@/lib/workspace/pricing";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requirePermission("pricing.edit", "PricingRule");
    const { id } = await context.params;
    const listing = await prisma.listing.findUniqueOrThrow({ where: { id } });
    const payload = await parseJsonBody(request, createPricingRuleSchema);
    const calculated = calculatePricing(payload);
    const pricingRule = await prisma.pricingRule.create({
      data: {
        ...payload,
        campaignFloorPrice: payload.campaignFloorPrice ?? calculated.campaignFloorPrice,
        minimumPrice: calculated.minimumPrice,
        submittedById: user.id,
        suggestedPrice: payload.suggestedPrice ?? calculated.suggestedPrice,
      },
    });
    await prisma.listing.update({
      data: { status: "PRICING" },
      where: { id: listing.id },
    });
    await writeActivity({
      action: "create-pricing",
      content: `从商品 ${listing.sku} 创建定价：${pricingRule.productName}`,
      entityId: listing.id,
      entityType: "Listing",
      userId: user.id,
    });

    return apiSuccess({ pricingRule: serializePricingRule(pricingRule) });
  } catch (error) {
    return handleApiError(error);
  }
}
