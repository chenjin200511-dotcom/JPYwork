// Purpose: Provides a lightweight health check for the Next.js API layer.
import { apiSuccess } from "@/lib/api/response";

export function GET() {
  return apiSuccess({
    service: "JPY backend",
    status: "ok",
    time: new Date().toISOString(),
  });
}
