// Purpose: Imports pasted CSV order rows.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { parseCsv } from "@/lib/api/csv";
import { apiSuccess } from "@/lib/api/response";
import { createOrderSchema, csvImportSchema } from "@/lib/api/schemas";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody } from "@/lib/api/validate";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await requirePermission("orders.manage", "Order");
    const payload = await parseJsonBody(request, csvImportSchema);
    const parsed = parseCsv(
      payload.csv,
      (row) =>
        createOrderSchema.parse({
          assigneeId: row.assigneeId || undefined,
          customerName: row.customerName,
          estimatedProfit: row.estimatedProfit ? Number(row.estimatedProfit) : undefined,
          externalOrderId: row.externalOrderId,
          platform: row.platform || "SHOPEE",
          riskFlags: row.riskFlags ? row.riskFlags.split("|") : [],
          riskLevel: row.riskLevel || "LOW",
          skuCount: row.skuCount ? Number(row.skuCount) : 0,
          status: row.status || "PENDING_SHIPMENT",
          totalAmount: row.totalAmount ? Number(row.totalAmount) : undefined,
        }),
      {
        failOnRowError: true,
        maxRows: 200,
        optionalHeaders: [
          "assigneeId",
          "estimatedProfit",
          "platform",
          "riskFlags",
          "riskLevel",
          "skuCount",
          "status",
          "totalAmount",
        ],
        requiredHeaders: ["externalOrderId", "customerName"],
      },
    );

    for (const row of parsed.rows) {
      await prisma.order.upsert({
        create: { ...row, riskFlags: row.riskFlags },
        update: { ...row, riskFlags: row.riskFlags },
        where: {
          platform_externalOrderId: {
            externalOrderId: row.externalOrderId,
            platform: row.platform,
          },
        },
      });
    }

    return apiSuccess(parsed);
  } catch (error) {
    return handleApiError(error);
  }
}
