// Purpose: Exports listing pipeline rows as CSV.
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { exportCsv } from "@/lib/api/csv";
import { handleApiError } from "@/lib/api/errors";
import { listingListQuerySchema } from "@/lib/api/schemas";
import { requirePermission } from "@/lib/api/authGuard";
import { parseSearchParams } from "@/lib/api/validate";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("data.export", "Listing");
    const query = parseSearchParams(request.url, listingListQuerySchema);
    const listings = await prisma.listing.findMany({
      orderBy: { updatedAt: "desc" },
      where: {
        ownerId: query.ownerId,
        platform: query.platform,
        status: query.status,
      },
    });
    const csv = exportCsv(
      ["sku", "title", "platform", "status", "currentStep", "cost", "targetPrice"],
      listings,
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Disposition": `attachment; filename="listings-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Content-Type": "text/csv; charset=utf-8",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
