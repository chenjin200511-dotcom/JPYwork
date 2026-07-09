// Purpose: Lets Owners verify the environment-configured external notification hook.
import type { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api/response";
import { requirePermission } from "@/lib/api/authGuard";
import { handleApiError } from "@/lib/api/errors";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import { sendExternalNotification } from "@/lib/notifications/externalNotification";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission("api.manage", "ApiConnection");
    const result = await sendExternalNotification({
      entityType: "Order",
      lines: [
        "JPY system configuration test",
        "If this appears on your phone, the notification hook is ready.",
      ],
      title: "JPY Notification Test",
    });

    await writeAuditLog({
      action: result.sent ? "notification.test.sent" : "notification.test.skipped",
      entityType: "ApiConnection",
      metadata: {
        reason: "reason" in result ? result.reason : "",
        sent: result.sent,
      },
      request,
      userId: user.id,
    });

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
