// Purpose: Verifies AI prompt preparation stays bounded and safely falls back.
import assert from "node:assert/strict";
import test from "node:test";
import { getAiRuntimeConfig } from "./config";
import { evaluateAiGuard } from "./copilot";
import { buildBriefingPrompt, buildPricingPrompt } from "./prompts";

test("AI runtime config reads safe defaults and clamps temperature", () => {
  const config = getAiRuntimeConfig({
    AI_TEMPERATURE: "3",
    AI_TOTAL_TOKEN_LIMIT: "1500",
    OPENAI_API_KEY: "present",
  });

  assert.equal(config.enabled, true);
  assert.equal(config.dailyTokenLimit, 1500);
  assert.equal(config.temperature, 1);
});

test("AI guard disables paid path when key or token budget is unavailable", () => {
  const prompt = buildBriefingPrompt({
    date: "2026-07-08",
    highlights: {
      inventoryAlerts: [],
      openMessages: [],
      openTasks: [{ priority: "HIGH", title: "处理低利润订单" }],
      orderRisks: [],
      pendingApprovals: [],
      pendingPricing: [],
    },
    metrics: {
      completedTasksToday: 1,
      inventoryAlertCount: 0,
      openMessageCount: 0,
      openTaskCount: 1,
      pendingApprovalCount: 0,
      pendingPricingCount: 0,
      riskyOrderCount: 0,
    },
    type: "PLAN",
  });

  assert.deepEqual(
    evaluateAiGuard(prompt, { dailyTokenLimit: 1000, enabled: false, temperature: 0.2 }),
    { allowed: false, reason: "AI_DISABLED" },
  );
  assert.deepEqual(
    evaluateAiGuard(prompt, { dailyTokenLimit: 1, enabled: true, temperature: 0.2 }),
    { allowed: false, reason: "AI_TOKEN_LIMIT" },
  );
});

test("pricing prompt uses calculated values without calling external services", () => {
  const prompt = buildPricingPrompt({
    output: {
      campaignFloorPrice: 118,
      expectedGrossMarginRate: 0.18,
      expectedGrossProfit: 20,
      minimumPrice: 110,
      riskLevel: "MEDIUM",
      suggestedPrice: 130,
      totalCost: 90,
    },
    productName: "测试商品",
    sku: "SKU-1",
  });

  assert.equal(prompt.purpose, "pricing");
  assert.match(prompt.messages[1].content, /建议售价：130/);
  assert.ok(prompt.estimatedTokens > 0);
});
