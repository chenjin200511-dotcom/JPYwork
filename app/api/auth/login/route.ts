// Purpose: Authenticates JPY team users against the database and sets an httpOnly session cookie.
import type { NextRequest } from "next/server";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { loginSchema } from "@/lib/api/schemas";
import { parseJsonBody } from "@/lib/api/validate";
import { verifyPassword } from "@/lib/auth/password";
import { createUserSession, setSessionCookie } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import { prisma } from "@/lib/db/prisma";
import { serializeUser } from "@/lib/api/serializers";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const payload = await parseJsonBody(request, loginSchema);
    const user = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    const isValid =
      user?.status === "ACTIVE" &&
      (await verifyPassword(payload.password, user.passwordHash));

    if (!user || !isValid) {
      await writeAuditLog({
        action: "auth.login_failed",
        entityType: "User",
        metadata: {
          email: payload.email,
        },
        request,
      });
      throw new ApiError("INVALID_CREDENTIALS", "账号或密码不正确", 401);
    }

    const { session, token } = await createUserSession(
      user.id,
      payload.rememberDevice,
    );

    await setSessionCookie(token, session);
    await writeAuditLog({
      action: "auth.login",
      entityId: user.id,
      entityType: "User",
      request,
      userId: user.id,
    });

    return apiSuccess({
      user: serializeUser(user),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
