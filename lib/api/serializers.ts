// Purpose: Converts Prisma records into stable JSON-friendly API payloads.
import type { Role, User } from "@prisma/client";

export type PublicUser = {
  email: string;
  id: string;
  name: string;
  role: Role;
};

type Jsonish = string | number | boolean | null | Jsonish[] | { [key: string]: Jsonish };

function isDecimalLike(value: unknown) {
  return (
    typeof value === "object" &&
    value !== null &&
    value.constructor?.name === "Decimal"
  );
}

export function serializeValue(value: unknown): Jsonish {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (isDecimalLike(value)) {
    return (value as { toString: () => string }).toString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        serializeValue(nestedValue),
      ]),
    );
  }

  return value as Jsonish;
}

export function serializeRecord<T extends object>(record: T) {
  return serializeValue(record) as T;
}

export const serializeTask = serializeRecord;
export const serializeOrder = serializeRecord;
export const serializePricingRule = serializeRecord;
export const serializeConnection = serializeRecord;
export const serializeMessage = serializeRecord;
export const serializeTemplate = serializeRecord;
export const serializeListing = serializeRecord;
export const serializeApproval = serializeRecord;
export const serializeInventory = serializeRecord;
export const serializeActivity = serializeRecord;
export const serializeBriefing = serializeRecord;
export const serializeAuditLog = serializeRecord;

export function serializeUser(user: Pick<User, "email" | "id" | "name" | "role">): PublicUser {
  return {
    email: user.email,
    id: user.id,
    name: user.name,
    role: user.role,
  };
}
