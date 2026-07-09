// Purpose: Centralizes role-based permission checks for JPY workspace APIs.
import type { Role } from "@prisma/client";

export type PermissionAction =
  | "api.manage"
  | "approval.decide"
  | "approval.view"
  | "audit.view"
  | "briefing.manage"
  | "briefing.view"
  | "content.edit"
  | "dashboard.view"
  | "data.export"
  | "finance.view"
  | "inventory.manage"
  | "inventory.view"
  | "listing.manage"
  | "listing.view"
  | "messages.manage"
  | "messages.view"
  | "orders.manage"
  | "orders.view"
  | "pricing.approve"
  | "pricing.edit"
  | "pricing.view"
  | "tasks.manage"
  | "tasks.view"
  | "users.manage";

export type PermissionResource =
  | "ApiConnection"
  | "Approval"
  | "Activity"
  | "AuditLog"
  | "Briefing"
  | "ContentVersion"
  | "Dashboard"
  | "Finance"
  | "Inventory"
  | "Listing"
  | "Message"
  | "Order"
  | "PricingRule"
  | "Task"
  | "User";

type PermissionUser = {
  role: Role;
} | null;

const permissionsByRole: Record<Role, Set<PermissionAction>> = {
  OWNER: new Set([
    "api.manage",
    "approval.decide",
    "approval.view",
    "audit.view",
    "briefing.manage",
    "briefing.view",
    "content.edit",
    "data.export",
    "dashboard.view",
    "finance.view",
    "inventory.manage",
    "inventory.view",
    "listing.manage",
    "listing.view",
    "messages.manage",
    "messages.view",
    "orders.manage",
    "orders.view",
    "pricing.approve",
    "pricing.edit",
    "pricing.view",
    "tasks.manage",
    "tasks.view",
    "users.manage",
  ]),
  OPERATOR: new Set([
    "approval.view",
    "briefing.manage",
    "briefing.view",
    "dashboard.view",
    "inventory.manage",
    "inventory.view",
    "listing.manage",
    "listing.view",
    "messages.manage",
    "messages.view",
    "orders.manage",
    "orders.view",
    "pricing.edit",
    "pricing.view",
    "tasks.manage",
    "tasks.view",
  ]),
  SUPPORT: new Set([
    "approval.view",
    "briefing.manage",
    "briefing.view",
    "dashboard.view",
    "messages.view",
    "messages.manage",
    "orders.manage",
    "orders.view",
    "tasks.manage",
    "tasks.view",
  ]),
};

export function can(
  user: PermissionUser,
  action: PermissionAction,
  resource: PermissionResource,
) {
  void resource;

  if (!user) {
    return false;
  }

  return permissionsByRole[user.role].has(action);
}
