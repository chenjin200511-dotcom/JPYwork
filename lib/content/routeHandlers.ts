// Purpose: Shares DB-first content API behavior across site, workspace, and theme routes.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import {
  contentRouteQuerySchema,
  contentRouteUpdateSchema,
} from "@/lib/api/schemas";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody, parseSearchParams } from "@/lib/api/validate";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import {
  type ContentKey,
  getLatestContentVersion,
  saveContentVersion,
} from "./contentStore";

export function createContentRouteHandlers(key: ContentKey) {
  return {
    async GET(request: NextRequest) {
      try {
        const query = parseSearchParams(request.url, contentRouteQuerySchema);
        const language = key === "theme" ? "neutral" : query.lang;
        const result = await getLatestContentVersion(key, language);

        return apiSuccess({
          content: result.content,
          key,
          language,
          source: result.source,
          version: result.version,
        });
      } catch (error) {
        return handleApiError(error);
      }
    },

    async PUT(request: NextRequest) {
      try {
        const user = await requirePermission("content.edit", "ContentVersion");
        const query = parseSearchParams(request.url, contentRouteQuerySchema);
        const payload = await parseJsonBody(request, contentRouteUpdateSchema);
        const language = key === "theme" ? "neutral" : query.lang;
        const saved = await saveContentVersion({
          contentJson: payload.contentJson,
          createdBy: user.id,
          key,
          language,
        });

        await writeAuditLog({
          action: "content.version_create",
          entityId: saved.id,
          entityType: "ContentVersion",
          metadata: {
            key,
            language,
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
    },
  };
}
