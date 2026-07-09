// Purpose: Accepts normalized listing JSON from Miaoshou, Shopee, or a browser extension.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { webhookListingSchema } from "@/lib/api/schemas";
import { serializeListing } from "@/lib/api/serializers";
import { parseJsonBody } from "@/lib/api/validate";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import { prisma } from "@/lib/db/prisma";
import { normalizeWebhookListing } from "@/lib/integrations/normalize";
import { requireIntegrationWebhookToken } from "@/lib/integrations/webhookAuth";
import { getWebhookErrorInfo, recordWebhookLog } from "@/lib/webhooks/logs";
import { writeActivity } from "@/lib/workspace/activity";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let externalId: string | null = null;
  let recordId: string | null = null;
  let source: string | null = null;

  try {
    requireIntegrationWebhookToken(request);
    const payload = await parseJsonBody(request, webhookListingSchema);
    externalId = payload.sku;
    source = payload.source;
    const normalized = normalizeWebhookListing(payload);
    const existing = await prisma.listing.findFirst({
      where: {
        platform: normalized.data.platform,
        sku: normalized.data.sku,
      },
    });
    const listing = existing
      ? await prisma.listing.update({
          data: normalized.data,
          where: { id: existing.id },
        })
      : await prisma.listing.create({ data: normalized.data });
    recordId = listing.id;

    await writeActivity({
      action: "webhook.listing.upsert",
      content: `Webhook 写入商品：${listing.sku}`,
      entityId: listing.id,
      entityType: "Listing",
    });
    await writeAuditLog({
      action: "webhook.listing.upsert",
      entityId: listing.id,
      entityType: "Listing",
      metadata: { source: normalized.source },
      request,
    });
    await recordWebhookLog({
      externalId,
      message: `Listing ${listing.sku} synced`,
      recordId,
      request,
      source: normalized.source,
      status: "SUCCESS",
      target: "listings",
    });

    return apiSuccess({ listing: serializeListing(listing), source: normalized.source });
  } catch (error) {
    const info = getWebhookErrorInfo(error);
    await recordWebhookLog({
      externalId,
      message: info.message,
      reason: info.reason,
      recordId,
      request,
      source,
      status: "FAILED",
      target: "listings",
    });
    return handleApiError(error);
  }
}
