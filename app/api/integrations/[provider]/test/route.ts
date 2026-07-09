// Purpose: Tests reserved integration configuration without calling external APIs.
import type { NextRequest } from "next/server";
import { connectionProviderSchema } from "@/lib/api/schemas";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { requirePermission } from "@/lib/api/authGuard";
import { getIntegrationStatuses } from "@/lib/integrations/status";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ provider: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    await requirePermission("api.manage", "ApiConnection");
    const { provider } = await context.params;
    const parsedProvider = connectionProviderSchema.parse(provider.toUpperCase());
    const status = getIntegrationStatuses().find((candidate) => {
      const normalized = candidate.provider
        .replace("TikTok Shop", "TIKTOK")
        .replace("Miaoshou ERP", "MIAOSHOU")
        .replace("Exchange Rate", "EXCHANGE_RATE")
        .toUpperCase()
        .replaceAll(" ", "_");
      return normalized === parsedProvider;
    });

    return apiSuccess({
      configured: Boolean(status?.configured),
      missingEnvKeys: status?.missingEnvKeys ?? [],
      provider: parsedProvider,
      status: status?.configured ? "CONNECTED" : "KEY_REQUIRED",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
