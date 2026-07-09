// Purpose: Updates one inventory item.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { patchInventorySchema } from "@/lib/api/schemas";
import { serializeInventory } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody } from "@/lib/api/validate";
import { prisma } from "@/lib/db/prisma";
import { writeActivity } from "@/lib/workspace/activity";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function computeInventoryStatus(available: number, safetyStock: number) {
  if (available <= 0) {
    return "OUT_OF_STOCK" as const;
  }

  if (available < safetyStock) {
    return "LOW_STOCK" as const;
  }

  return "NORMAL" as const;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requirePermission("inventory.manage", "Inventory");
    const { id } = await context.params;
    const payload = await parseJsonBody(request, patchInventorySchema);
    const current = await prisma.inventoryItem.findUniqueOrThrow({ where: { id } });
    const available = payload.available ?? current.available;
    const safetyStock = payload.safetyStock ?? current.safetyStock;
    const item = await prisma.inventoryItem.update({
      data: {
        ...payload,
        status: payload.status ?? computeInventoryStatus(available, safetyStock),
      },
      where: { id },
    });
    await writeActivity({
      action: "update",
      content: `更新库存项：${item.sku}`,
      entityId: item.id,
      entityType: "InventoryItem",
      userId: user.id,
    });

    return apiSuccess({ item: serializeInventory(item) });
  } catch (error) {
    return handleApiError(error);
  }
}
