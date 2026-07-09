// Purpose: Exports inventory rows as CSV.
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { exportCsv } from "@/lib/api/csv";
import { handleApiError } from "@/lib/api/errors";
import { inventoryListQuerySchema } from "@/lib/api/schemas";
import { requirePermission } from "@/lib/api/authGuard";
import { parseSearchParams } from "@/lib/api/validate";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("data.export", "Inventory");
    const query = parseSearchParams(request.url, inventoryListQuerySchema);
    const items = await prisma.inventoryItem.findMany({
      orderBy: { updatedAt: "desc" },
      where: { status: query.status },
    });
    const csv = exportCsv(
      ["sku", "productName", "available", "safetyStock", "incoming", "status", "note"],
      items,
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Disposition": `attachment; filename="inventory-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Content-Type": "text/csv; charset=utf-8",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
