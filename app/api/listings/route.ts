// Purpose: Provides listing pipeline endpoints.
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { handleApiError } from "@/lib/api/errors";
import { getPagination, paginationMeta } from "@/lib/api/pagination";
import { apiSuccess } from "@/lib/api/response";
import { createListingSchema, listingListQuerySchema } from "@/lib/api/schemas";
import { serializeListing } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody, parseSearchParams } from "@/lib/api/validate";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import { prisma } from "@/lib/db/prisma";
import { writeActivity } from "@/lib/workspace/activity";

export const runtime = "nodejs";

function listingWhere(query: ReturnType<typeof listingListQuerySchema.parse>): Prisma.ListingWhereInput {
  return {
    ownerId: query.ownerId,
    platform: query.platform,
    status: query.status,
    OR: query.search
      ? [{ title: { contains: query.search } }, { sku: { contains: query.search } }]
      : undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    await requirePermission("listing.view", "Listing");
    const query = parseSearchParams(request.url, listingListQuerySchema);
    const where = listingWhere(query);
    const { skip, take } = getPagination(query.page, query.pageSize);
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        include: {
          owner: { select: { email: true, id: true, name: true, role: true } },
        },
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        skip,
        take,
        where,
      }),
      prisma.listing.count({ where }),
    ]);

    return apiSuccess({
      ...paginationMeta({ page: query.page, pageSize: query.pageSize, total }),
      listings: listings.map(serializeListing),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission("listing.manage", "Listing");
    const payload = await parseJsonBody(request, createListingSchema);
    const listing = await prisma.listing.create({ data: payload });
    await writeActivity({
      action: "create",
      content: `创建上架流程：${listing.title}`,
      entityId: listing.id,
      entityType: "Listing",
      userId: user.id,
    });
    await writeAuditLog({
      action: "listing.create",
      entityId: listing.id,
      entityType: "Listing",
      request,
      userId: user.id,
    });

    return apiSuccess({ listing: serializeListing(listing) });
  } catch (error) {
    return handleApiError(error);
  }
}
