// Purpose: Reads and versions public homepage content.
import { createContentRouteHandlers } from "@/lib/content/routeHandlers";

export const runtime = "nodejs";

const handlers = createContentRouteHandlers("site");

export const GET = handlers.GET;
export const PUT = handlers.PUT;
