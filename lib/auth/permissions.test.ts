import assert from "node:assert/strict";
import { test } from "node:test";
import { can } from "./permissions.ts";

test("owner can manage sensitive workspace areas", () => {
  assert.equal(can({ role: "OWNER" }, "api.manage", "ApiConnection"), true);
  assert.equal(can({ role: "OWNER" }, "pricing.approve", "PricingRule"), true);
  assert.equal(can({ role: "OWNER" }, "content.edit", "ContentVersion"), true);
});

test("operator cannot approve pricing or manage api keys", () => {
  assert.equal(can({ role: "OPERATOR" }, "pricing.edit", "PricingRule"), true);
  assert.equal(can({ role: "OPERATOR" }, "pricing.approve", "PricingRule"), false);
  assert.equal(can({ role: "OPERATOR" }, "api.manage", "ApiConnection"), false);
});

test("support has limited operational access", () => {
  assert.equal(can({ role: "SUPPORT" }, "orders.manage", "Order"), true);
  assert.equal(can({ role: "SUPPORT" }, "finance.view", "Finance"), false);
  assert.equal(can(null, "dashboard.view", "Dashboard"), false);
});
