// Purpose: Provides authenticated list/create endpoints for pricing approvals.
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { handleApiError } from "@/lib/api/errors";
import { getPagination, paginationMeta } from "@/lib/api/pagination";
import { apiSuccess } from "@/lib/api/response";
import { createPricingRuleSchema, pricingListQuerySchema } from "@/lib/api/schemas";
import { serializePricingRule } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody, parseSearchParams } from "@/lib/api/validate";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import { prisma } from "@/lib/db/prisma";
import { writeActivity } from "@/lib/workspace/activity";
import { calculatePricing } from "@/lib/workspace/pricing";

export const runtime = "nodejs";

function pricingWhere(query: ReturnType<typeof pricingListQuerySchema.parse>): Prisma.PricingRuleWhereInput {
  return {
    sku: query.sku,
    status: query.status,
    OR: query.search
      ? [{ sku: { contains: query.search } }, { productName: { contains: query.search } }]
      : undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    await requirePermission("pricing.view", "PricingRule");
    const query = parseSearchParams(request.url, pricingListQuerySchema);
    const where = pricingWhere(query);
    const { skip, take } = getPagination(query.page, query.pageSize);
    const [pricingRules, total] = await Promise.all([
      prisma.pricingRule.findMany({
        include: {
          approver: { select: { email: true, id: true, name: true, role: true } },
          submitter: { select: { email: true, id: true, name: true, role: true } },
        },
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        skip,
        take,
        where,
      }),
      prisma.pricingRule.count({ where }),
    ]);

    return apiSuccess({
      ...paginationMeta({ page: query.page, pageSize: query.pageSize, total }),
      pricingRules: pricingRules.map(serializePricingRule),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission("pricing.edit", "PricingRule");
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

    await writeActivity({
      action: "create",
      content: `创建定价：${pricingRule.productName}`,
      entityId: pricingRule.id,
      entityType: "PricingRule",
      userId: user.id,
    });
    await writeAuditLog({
      action: "pricing_rule.create",
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
