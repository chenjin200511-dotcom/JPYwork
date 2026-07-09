// Purpose: Accepts normalized order JSON from future platform APIs or a JPY browser extension.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { webhookOrderSchema } from "@/lib/api/schemas";
import { serializeOrder } from "@/lib/api/serializers";
import { parseJsonBody } from "@/lib/api/validate";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import { prisma } from "@/lib/db/prisma";
import { normalizeWebhookOrder } from "@/lib/integrations/normalize";
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
    const payload = await parseJsonBody(request, webhookOrderSchema);
    externalId = payload.externalOrderId;
    source = payload.source;
    const normalized = normalizeWebhookOrder(payload);
    const order = await prisma.order.upsert({
      create: normalized.data,
      update: normalized.data,
      where: {
        platform_externalOrderId: {
          externalOrderId: normalized.data.externalOrderId,
          platform: normalized.data.platform,
        },
      },
    });
    recordId = order.id;

    await writeActivity({
      action: "webhook.order.upsert",
      content: `Webhook 写入订单：${order.externalOrderId}`,
      entityId: order.id,
      entityType: "Order",
    });
    await writeAuditLog({
      action: "webhook.order.upsert",
      entityId: order.id,
      entityType: "Order",
      metadata: { source: normalized.source },
      request,
    });
    await recordWebhookLog({
      externalId,
      message: `Order ${order.externalOrderId} synced`,
      recordId,
      request,
      source: normalized.source,
      status: "SUCCESS",
      target: "orders",
    });

    return apiSuccess({ order: serializeOrder(order), source: normalized.source });
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
      target: "orders",
    });
    return handleApiError(error);
  }
}
