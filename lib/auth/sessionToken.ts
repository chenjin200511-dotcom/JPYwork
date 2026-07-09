// Purpose: Provides pure helpers for secure session token creation and public user payloads.
import crypto from "node:crypto";
import type { User } from "@prisma/client";

const DEFAULT_SESSION_DAYS = Number(process.env.SESSION_EXPIRES_DAYS || 14);

export type AuthenticatedUser = Pick<User, "id" | "email" | "name" | "role" | "status">;

export function createSessionToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getSessionExpiry(rememberDevice: boolean) {
  const days = rememberDevice ? DEFAULT_SESSION_DAYS : 1;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function toPublicUser(user: AuthenticatedUser) {
  return {
    email: user.email,
    id: user.id,
    name: user.name,
    role: user.role,
  };
}
