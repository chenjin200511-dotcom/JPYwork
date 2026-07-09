// Purpose: Guards API routes with login and role permissions.
import { getCurrentUser } from "@/lib/auth/currentUser";
import { can, type PermissionAction, type PermissionResource } from "@/lib/auth/permissions";
import { forbiddenError, unauthorizedError } from "./errors";

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw unauthorizedError();
  }

  return user;
}

export async function requirePermission(
  action: PermissionAction,
  resource: PermissionResource,
) {
  const user = await requireUser();

  if (!can(user, action, resource)) {
    throw forbiddenError();
  }

  return user;
}
