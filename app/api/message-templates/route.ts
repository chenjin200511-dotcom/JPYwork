// Purpose: Provides reusable customer reply templates.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { createMessageTemplateSchema } from "@/lib/api/schemas";
import { serializeTemplate } from "@/lib/api/serializers";
import { requirePermission } from "@/lib/api/authGuard";
import { parseJsonBody } from "@/lib/api/validate";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requirePermission("messages.view", "Message");
    const templates = await prisma.messageTemplate.findMany({
      orderBy: [{ category: "asc" }, { title: "asc" }],
    });

    return apiSuccess({ templates: templates.map(serializeTemplate) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("messages.manage", "Message");
    const payload = await parseJsonBody(request, createMessageTemplateSchema);
    const template = await prisma.messageTemplate.create({ data: payload });

    return apiSuccess({ template: serializeTemplate(template) });
  } catch (error) {
    return handleApiError(error);
  }
}
