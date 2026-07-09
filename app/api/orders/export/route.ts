// Purpose: Exports current orders as CSV.
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { exportCsv } from "@/lib/api/csv";
import { handleApiError } from "@/lib/api/errors";
import { orderListQuerySchema } from "@/lib/api/schemas";
import { requirePermission } from "@/lib/api/authGuard";
import { parseSearchParams } from "@/lib/api/validate";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("data.export", "Order");
    const query = parseSearchParams(request.url, orderListQuerySchema);
    const orders = await prisma.order.findMany({
      orderBy: { updatedAt: "desc" },
      where: {
        platform: query.platform,
        riskLevel: query.riskLevel,
        status: query.status,
      },
    });
    const csv = exportCsv(
      [
        "externalOrderId",
        "platform",
        "customerName",
        "status",
        "riskLevel",
        "skuCount",
        "totalAmount",
        "estimatedProfit",
        "riskFlags",
      ],
      orders.map((order) => ({
        ...order,
        riskFlags: Array.isArray(order.riskFlags) ? order.riskFlags.join("|") : "",
      })),
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Content-Type": "text/csv; charset=utf-8",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
