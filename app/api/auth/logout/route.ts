// Purpose: Clears the current httpOnly session cookie and deletes the server session.
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import {
  clearSessionCookie,
  deleteSessionByToken,
  findSessionByToken,
  getSessionTokenFromCookie,
} from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const token = await getSessionTokenFromCookie();
    const session = await findSessionByToken(token);

    await deleteSessionByToken(token);
    await clearSessionCookie();

    if (session) {
      await writeAuditLog({
        action: "auth.logout",
        entityId: session.userId,
        entityType: "User",
        request,
        userId: session.userId,
      });
    }

    return apiSuccess({
      signedOut: true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
