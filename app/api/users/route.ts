// Purpose: Returns safe public team user records for assignment controls.
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { serializeUser } from "@/lib/api/serializers";
import { requireUser } from "@/lib/api/authGuard";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireUser();
    const users = await prisma.user.findMany({
      orderBy: { role: "asc" },
      select: {
        email: true,
        id: true,
        name: true,
        role: true,
      },
      where: { status: "ACTIVE" },
    });

    return apiSuccess({ users: users.map(serializeUser) });
  } catch (error) {
    return handleApiError(error);
  }
}
