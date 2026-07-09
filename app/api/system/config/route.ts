// Purpose: Returns Owner-only runtime configuration health without exposing secrets.
import { apiSuccess } from "@/lib/api/response";
import { requirePermission } from "@/lib/api/authGuard";
import { handleApiError } from "@/lib/api/errors";
import { getAiRuntimeConfig } from "@/lib/ai/config";
import { getIntegrationStatuses } from "@/lib/integrations/status";
import { getNotificationRuntimeConfig } from "@/lib/notifications/config";
import { getWebhookRuntimeConfig } from "@/lib/webhooks/config";
import { getWebhookLogSummary, listWebhookLogs } from "@/lib/webhooks/logs";

export const runtime = "nodejs";

function aiMissingEnvKeys(ai: ReturnType<typeof getAiRuntimeConfig>) {
  const missing: string[] = [];

  if (!process.env.OPENAI_API_KEY) {
    missing.push("OPENAI_API_KEY");
  }

  if (ai.dailyTokenLimit <= 0) {
    missing.push("AI_TOTAL_TOKEN_LIMIT");
  }

  return missing;
}

export async function GET() {
  try {
    await requirePermission("api.manage", "ApiConnection");
    const ai = getAiRuntimeConfig();
    const [webhookSummary, recentWebhookLogs] = await Promise.all([
      getWebhookLogSummary(),
      listWebhookLogs({ page: 1, pageSize: 8 }),
    ]);

    return apiSuccess({
      ai: {
        ...ai,
        fallbackMode: "rule-based",
        missingEnvKeys: aiMissingEnvKeys(ai),
      },
      integrations: getIntegrationStatuses(),
      notification: getNotificationRuntimeConfig(),
      webhook: {
        ...getWebhookRuntimeConfig(),
        recentLogs: recentWebhookLogs.logs,
        summary: webhookSummary,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
