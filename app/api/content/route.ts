// Purpose: Serves and versions configurable public/workspace content.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { contentQuerySchema, contentVersionSchema } from "@/lib/api/schemas";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody, parseSearchParams } from "@/lib/api/validate";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import {
  type ContentKey,
  getLatestContentVersion,
  saveContentVersion,
} from "@/lib/content/contentStore";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const query = parseSearchParams(request.url, contentQuerySchema);
    const language = query.key === "theme" ? "neutral" : query.language;
    const result = await getLatestContentVersion(query.key as ContentKey, language);

    return apiSuccess({
      content: result.content,
      key: query.key,
      language,
      source: result.source,
      version: result.version,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission("content.edit", "ContentVersion");
    const payload = await parseJsonBody(request, contentVersionSchema);
    const saved = await saveContentVersion({
      contentJson: payload.contentJson,
      createdBy: user.id,
      key: payload.key as ContentKey,
      language: payload.language,
    });

    await writeAuditLog({
      action: "content.version_create",
      entityId: saved.id,
      entityType: "ContentVersion",
      metadata: {
        key: payload.key,
        language: payload.language,
        version: saved.version,
      },
      request,
      userId: user.id,
    });

    return apiSuccess({
      id: saved.id,
      key: saved.key,
      language: saved.language,
      version: saved.version,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
