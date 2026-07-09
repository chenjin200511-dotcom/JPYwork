// Purpose: Verifies protected API schemas do not accept secret-like integration config.
import assert from "node:assert/strict";
import test from "node:test";
import { updateConnectionSchema } from "./schemas";

test("connection updates reject encrypted config or secret payload fields", () => {
  const result = updateConnectionSchema.safeParse({
    encryptedConfig: "do-not-store-api-keys-here",
    provider: "SHOPEE",
    status: "RESERVED",
  });

  assert.equal(result.success, false);
});

test("connection updates still allow status-only integration state changes", () => {
  const result = updateConnectionSchema.safeParse({
    provider: "SHOPEE",
    status: "KEY_REQUIRED",
  });

  assert.equal(result.success, true);
});
