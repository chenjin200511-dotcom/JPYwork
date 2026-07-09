// Purpose: Returns the current JPY team user resolved from the httpOnly session cookie.
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/currentUser";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();

    return apiSuccess({
      user,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
