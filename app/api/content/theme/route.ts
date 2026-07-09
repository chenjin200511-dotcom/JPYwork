// Purpose: Reads and versions configurable UI theme tokens.
import { createContentRouteHandlers } from "@/lib/content/routeHandlers";

export const runtime = "nodejs";

const handlers = createContentRouteHandlers("theme");

export const GET = handlers.GET;
export const PUT = handlers.PUT;
