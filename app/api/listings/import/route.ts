// Purpose: Imports pasted CSV listing rows.
import type { NextRequest } from "next/server";
import { parseCsv } from "@/lib/api/csv";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { createListingSchema, csvImportSchema } from "@/lib/api/schemas";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody } from "@/lib/api/validate";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await requirePermission("listing.manage", "Listing");
    const payload = await parseJsonBody(request, csvImportSchema);
    const parsed = parseCsv(
      payload.csv,
      (row) =>
        createListingSchema.parse({
          cost: row.cost ? Number(row.cost) : undefined,
          currentStep: row.currentStep || undefined,
          ownerId: row.ownerId || undefined,
          platform: row.platform || "SHOPEE",
          sku: row.sku,
          status: row.status || "IDEA",
          targetPrice: row.targetPrice ? Number(row.targetPrice) : undefined,
          title: row.title,
        }),
      {
        failOnRowError: true,
        maxRows: 200,
        optionalHeaders: [
          "cost",
          "currentStep",
          "ownerId",
          "platform",
          "status",
          "targetPrice",
        ],
        requiredHeaders: ["sku", "title"],
      },
    );

    for (const row of parsed.rows) {
      await prisma.listing.create({ data: row });
    }

    return apiSuccess(parsed);
  } catch (error) {
    return handleApiError(error);
  }
}
