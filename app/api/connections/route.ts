// Purpose: Lists and updates reserved third-party integration connection states.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { connectionListQuerySchema, updateConnectionSchema } from "@/lib/api/schemas";
import { serializeConnection } from "@/lib/api/serializers";
import { requirePermission, requireUser } from "@/lib/api/authGuard";
import { parseJsonBody, parseSearchParams } from "@/lib/api/validate";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import { prisma } from "@/lib/db/prisma";
import { integrationPlaceholders } from "@/lib/integrations/providers";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const query = parseSearchParams(request.url, connectionListQuerySchema);
    const where = {
      provider: query.provider,
      status: query.status,
    };
    const skip = (query.page - 1) * query.pageSize;
    const [connections, total] = await Promise.all([
      prisma.apiConnection.findMany({
        orderBy: {
          provider: "asc",
        },
        skip,
        take: query.pageSize,
        where,
      }),
      prisma.apiConnection.count({
        where,
      }),
    ]);

    return apiSuccess({
      connections: connections.map(serializeConnection),
      page: query.page,
      pageSize: query.pageSize,
      placeholders: integrationPlaceholders,
      total,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission("api.manage", "ApiConnection");
    const payload = await parseJsonBody(request, updateConnectionSchema);
    const connection = await prisma.apiConnection.upsert({
      create: {
        displayName: payload.provider.replaceAll("_", " "),
        provider: payload.provider,
        status: payload.status,
      },
      update: {
        status: payload.status,
      },
      where: {
        provider: payload.provider,
      },
    });

    await writeAuditLog({
      action: "api_connection.create",
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

export async function PATCH(request: NextRequest) {
  try {
    const user = await requirePermission("api.manage", "ApiConnection");
    const payload = await parseJsonBody(request, updateConnectionSchema);
    const connection = await prisma.apiConnection.upsert({
      create: {
        displayName: payload.provider.replaceAll("_", " "),
        provider: payload.provider,
        status: payload.status,
      },
      update: {
        status: payload.status,
      },
      where: {
        provider: payload.provider,
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
