// Purpose: Accepts normalized inventory JSON from future APIs or a browser extension.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { webhookInventorySchema } from "@/lib/api/schemas";
import { serializeInventory } from "@/lib/api/serializers";
import { parseJsonBody } from "@/lib/api/validate";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import { prisma } from "@/lib/db/prisma";
import { normalizeWebhookInventory } from "@/lib/integrations/normalize";
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
    const payload = await parseJsonBody(request, webhookInventorySchema);
    externalId = payload.sku;
    source = payload.source;
    const normalized = normalizeWebhookInventory(payload);
    const item = await prisma.inventoryItem.upsert({
      create: normalized.data,
      update: normalized.data,
      where: { sku: normalized.data.sku },
    });
    recordId = item.id;

    await writeActivity({
      action: "webhook.inventory.upsert",
      content: `Webhook 写入库存：${item.sku}`,
      entityId: item.id,
      entityType: "InventoryItem",
    });
    await writeAuditLog({
      action: "webhook.inventory.upsert",
      entityId: item.id,
      entityType: "InventoryItem",
      metadata: { source: normalized.source },
      request,
    });
    await recordWebhookLog({
      externalId,
      message: `Inventory ${item.sku} synced`,
      recordId,
      request,
      source: normalized.source,
      status: "SUCCESS",
      target: "inventory",
    });

    return apiSuccess({ item: serializeInventory(item), source: normalized.source });
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
      target: "inventory",
    });
    return handleApiError(error);
  }
}
