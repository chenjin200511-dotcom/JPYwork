// Purpose: Updates one API connection record by route id.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { updateConnectionSchema } from "@/lib/api/schemas";
import { serializeConnection } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody } from "@/lib/api/validate";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requirePermission("api.manage", "ApiConnection");
    const { id } = await context.params;
    const payload = await parseJsonBody(request, updateConnectionSchema);
    const connection = await prisma.apiConnection.update({
      data: {
        displayName: payload.provider.replaceAll("_", " "),
        provider: payload.provider,
        status: payload.status,
      },
      where: {
        id,
      },
    });

    await writeAuditLog({
      action: "api_connection.update",
      entityId: connection.id,
      entityType: "ApiConnection",
      metadata: {
        provider: connection.provider,
        status: connection.status,
      },
      request,
      userId: user.id,
    });

    return apiSuccess({
      connection: serializeConnection(connection),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
