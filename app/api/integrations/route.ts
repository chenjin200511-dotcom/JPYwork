// Purpose: Exposes reserved integration placeholders without calling external services.
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { requireUser } from "@/lib/api/authGuard";
import { getAiRuntimeConfig } from "@/lib/ai/config";
import { integrationPlaceholders } from "@/lib/integrations/providers";
import { getIntegrationStatuses } from "@/lib/integrations/status";
import { getPaymentPlaceholder } from "@/lib/integrations/payment/client";
import { getFinanceTaxPlaceholder } from "@/lib/integrations/tax/client";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    const isOwner = user.role === "OWNER";
    const statuses = getIntegrationStatuses().map((status) =>
      isOwner ? status : { ...status, missingEnvKeys: [] },
    );

    return apiSuccess({
      ai: isOwner ? getAiRuntimeConfig() : undefined,
      financeTax: getFinanceTaxPlaceholder(),
      integrations: integrationPlaceholders,
      payment: getPaymentPlaceholder(),
      note: "Reserved integration metadata only. No external API calls are made.",
      statuses,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
