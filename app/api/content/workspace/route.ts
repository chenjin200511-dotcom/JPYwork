// Purpose: Reads and versions workspace placeholder content.
import { createContentRouteHandlers } from "@/lib/content/routeHandlers";

export const runtime = "nodejs";

const handlers = createContentRouteHandlers("workspace");

export const GET = handlers.GET;
export const PUT = handlers.PUT;
