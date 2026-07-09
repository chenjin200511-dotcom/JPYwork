// Purpose: Imports pasted CSV inventory rows.
import type { NextRequest } from "next/server";
import { parseCsv } from "@/lib/api/csv";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { createInventorySchema, csvImportSchema } from "@/lib/api/schemas";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody } from "@/lib/api/validate";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

function computeInventoryStatus(available: number, safetyStock: number) {
  if (available <= 0) return "OUT_OF_STOCK";
  if (available < safetyStock) return "LOW_STOCK";
  return "NORMAL";
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("inventory.manage", "Inventory");
    const payload = await parseJsonBody(request, csvImportSchema);
    const parsed = parseCsv(
      payload.csv,
      (row) => {
        const available = row.available ? Number(row.available) : 0;
        const safetyStock = row.safetyStock ? Number(row.safetyStock) : 0;
        return createInventorySchema.parse({
          available,
          incoming: row.incoming ? Number(row.incoming) : 0,
          note: row.note || undefined,
          productName: row.productName,
          safetyStock,
          sku: row.sku,
          status: row.status || computeInventoryStatus(available, safetyStock),
        });
      },
      {
        failOnRowError: true,
        maxRows: 200,
        optionalHeaders: ["available", "incoming", "note", "safetyStock", "status"],
        requiredHeaders: ["sku", "productName"],
      },
    );

    for (const row of parsed.rows) {
      await prisma.inventoryItem.upsert({
        create: row,
        update: row,
        where: { sku: row.sku },
      });
    }

    return apiSuccess(parsed);
  } catch (error) {
    return handleApiError(error);
  }
}
