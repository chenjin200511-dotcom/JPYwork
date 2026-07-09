// Purpose: Provides inventory alert endpoints.
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { handleApiError } from "@/lib/api/errors";
import { getPagination, paginationMeta } from "@/lib/api/pagination";
import { apiSuccess } from "@/lib/api/response";
import { createInventorySchema, inventoryListQuerySchema } from "@/lib/api/schemas";
import { serializeInventory } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody, parseSearchParams } from "@/lib/api/validate";
import { prisma } from "@/lib/db/prisma";
import { writeActivity } from "@/lib/workspace/activity";

export const runtime = "nodejs";

function computeInventoryStatus(available: number, safetyStock: number) {
  if (available <= 0) {
    return "OUT_OF_STOCK" as const;
  }

  if (available < safetyStock) {
    return "LOW_STOCK" as const;
  }

  return "NORMAL" as const;
}

function inventoryWhere(query: ReturnType<typeof inventoryListQuerySchema.parse>): Prisma.InventoryItemWhereInput {
  return {
    status: query.status,
    OR: query.search
      ? [{ sku: { contains: query.search } }, { productName: { contains: query.search } }]
      : undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    await requirePermission("inventory.view", "Inventory");
    const query = parseSearchParams(request.url, inventoryListQuerySchema);
    const where = inventoryWhere(query);
    const { skip, take } = getPagination(query.page, query.pageSize);
    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        orderBy: [{ status: "desc" }, { updatedAt: "desc" }],
        skip,
        take,
        where,
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    return apiSuccess({
      ...paginationMeta({ page: query.page, pageSize: query.pageSize, total }),
      items: items.map(serializeInventory),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission("inventory.manage", "Inventory");
    const payload = await parseJsonBody(request, createInventorySchema);
    const item = await prisma.inventoryItem.create({
      data: {
        ...payload,
        status: payload.status ?? computeInventoryStatus(payload.available, payload.safetyStock),
      },
    });
    await writeActivity({
      action: "create",
      content: `创建库存项：${item.sku}`,
      entityId: item.id,
      entityType: "InventoryItem",
      userId: user.id,
    });

    return apiSuccess({ item: serializeInventory(item) });
  } catch (error) {
    return handleApiError(error);
  }
}
