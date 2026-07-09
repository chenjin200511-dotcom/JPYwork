// Purpose: Exposes the application version for deployment diagnostics.
import { apiSuccess } from "@/lib/api/response";

export function GET() {
  return apiSuccess({
    environment: process.env.NODE_ENV ?? "development",
    name: "JPY Team Workspace",
    version: process.env.npm_package_version ?? "0.1.0",
  });
}
