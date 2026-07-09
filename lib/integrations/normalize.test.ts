// Purpose: Verifies webhook JSON normalization keeps stored enums stable.
import assert from "node:assert/strict";
import test from "node:test";
import {
  computeInventoryStatus,
  normalizeWebhookInventory,
  normalizeWebhookListing,
  normalizeWebhookOrder,
} from "./normalize";

test("normalizes order webhook payload without changing enum constants", () => {
  const normalized = normalizeWebhookOrder({
    customerName: "Buyer A",
    estimatedProfit: 12,
    externalOrderId: "SHP-1001",
    platform: "SHOPEE",
    riskFlags: ["LOW_MARGIN"],
    riskLevel: "HIGH",
    skuCount: 2,
    source: "BROWSER_EXTENSION",
    status: "RISK",
    totalAmount: 88,
  });

  assert.equal(normalized.source, "BROWSER_EXTENSION");
  assert.equal(normalized.data.platform, "SHOPEE");
  assert.equal(normalized.data.status, "RISK");
  assert.deepEqual(normalized.data.riskFlags, ["LOW_MARGIN"]);
});

test("normalizes listing and inventory payloads for future API or extension writes", () => {
  const listing = normalizeWebhookListing({
    cost: 10,
    currentStep: "定价复核",
    platform: "SHOPEE",
    sku: "SKU-2001",
    source: "MIAOSHOU",
    status: "PRICING",
    targetPrice: 19.9,
    title: "测试商品",
  });
  const inventory = normalizeWebhookInventory({
    available: 2,
    incoming: 0,
    productName: "测试商品",
    safetyStock: 5,
    sku: "SKU-2001",
    source: "BROWSER_EXTENSION",
  });

  assert.equal(listing.data.status, "PRICING");
  assert.equal(inventory.data.status, "LOW_STOCK");
  assert.equal(computeInventoryStatus(0, 5), "OUT_OF_STOCK");
});
