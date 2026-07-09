// Purpose: Reads or updates one listing pipeline item.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { patchListingSchema } from "@/lib/api/schemas";
import { serializeListing } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody } from "@/lib/api/validate";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import { prisma } from "@/lib/db/prisma";
import { writeActivity } from "@/lib/workspace/activity";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requirePermission("listing.view", "Listing");
    const { id } = await context.params;
    const listing = await prisma.listing.findUnique({
      include: {
        owner: { select: { email: true, id: true, name: true, role: true } },
      },
      where: { id },
    });

    return apiSuccess({ listing: listing ? serializeListing(listing) : null });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requirePermission("listing.manage", "Listing");
    const { id } = await context.params;
    const payload = await parseJsonBody(request, patchListingSchema);
    const listing = await prisma.listing.update({
      data: payload,
      where: { id },
    });
    await writeActivity({
      action: "update",
      content: `更新上架流程：${listing.title}`,
      entityId: listing.id,
      entityType: "Listing",
      userId: user.id,
    });
    await writeAuditLog({
      action: "listing.update",
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
