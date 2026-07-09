// Purpose: Authenticates lightweight JSON webhook writes without storing platform passwords.
import crypto from "node:crypto";
import type { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/errors";

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function requireIntegrationWebhookToken(request: NextRequest) {
  const expectedToken = process.env.INTEGRATION_WEBHOOK_TOKEN;

  if (!expectedToken) {
    throw new ApiError("WEBHOOK_TOKEN_NOT_CONFIGURED", "Webhook Token 未配置", 503);
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const directToken = request.headers.get("x-jpy-webhook-token") ?? "";
  const providedToken = bearerToken || directToken;

  if (!providedToken || !safeEqual(providedToken, expectedToken)) {
    throw new ApiError("WEBHOOK_UNAUTHORIZED", "Webhook Token 不正确", 401);
  }

  return true;
}
