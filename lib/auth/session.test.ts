// Purpose: Verifies secure server session token helpers.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createSessionToken,
  getSessionExpiry,
  hashSessionToken,
  toPublicUser,
} from "./sessionToken.ts";

test("creates random session tokens and hashes them consistently", () => {
  const firstToken = createSessionToken();
  const secondToken = createSessionToken();

  assert.notEqual(firstToken, secondToken);
  assert.equal(firstToken.length >= 40, true);
  assert.equal(hashSessionToken(firstToken), hashSessionToken(firstToken));
  assert.notEqual(hashSessionToken(firstToken), firstToken);
});

test("remembered sessions last longer than single-device sessions", () => {
  const shortSession = getSessionExpiry(false).getTime();
  const rememberedSession = getSessionExpiry(true).getTime();

  assert.equal(rememberedSession > shortSession, true);
});

test("public user payload excludes password and status fields", () => {
  const user = toPublicUser({
    email: "owner@team.local",
    id: "user_1",
    name: "负责人",
    role: "OWNER",
    status: "ACTIVE",
  });

  assert.deepEqual(user, {
    email: "owner@team.local",
    id: "user_1",
    name: "负责人",
    role: "OWNER",
  });
});
