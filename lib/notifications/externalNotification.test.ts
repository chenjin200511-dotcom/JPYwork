// Purpose: Verifies external notification placeholders stay safe when no webhook is configured.
import assert from "node:assert/strict";
import test from "node:test";
import {
  buildExternalNotificationMarkdown,
  isOrderRiskSignal,
  sendExternalNotification,
} from "./externalNotification";

test("builds compact Markdown notification text", () => {
  const markdown = buildExternalNotificationMarkdown({
    entityId: "price-1",
    entityType: "PricingRule",
    lines: ["SKU：A1", "建议售价：99"],
    title: "JPY 定价审批待处理",
  });

  assert.match(markdown, /### JPY 定价审批待处理/);
  assert.match(markdown, /- SKU：A1/);
  assert.match(markdown, /> PricingRule: price-1/);
});

test("skips notification safely when webhook URL is absent", async () => {
  const previous = process.env.NOTIFICATION_WEBHOOK_URL;
  delete process.env.NOTIFICATION_WEBHOOK_URL;

  const result = await sendExternalNotification({
    entityId: "order-1",
    entityType: "Order",
    lines: ["订单：SHP-1", "风险：HIGH"],
    title: "JPY 订单风险待处理",
  });

  if (previous === undefined) {
    delete process.env.NOTIFICATION_WEBHOOK_URL;
  } else {
    process.env.NOTIFICATION_WEBHOOK_URL = previous;
  }
  assert.equal(result.sent, false);
  assert.equal(result.skipped, true);
  assert.equal(result.reason, "NOT_CONFIGURED");
});

test("detects order risk transitions", () => {
  assert.equal(isOrderRiskSignal({ riskLevel: "HIGH", status: "PENDING_SHIPMENT" }), true);
  assert.equal(isOrderRiskSignal({ riskLevel: "LOW", status: "RISK" }), true);
  assert.equal(isOrderRiskSignal({ riskLevel: "LOW", status: "SHIPPED" }), false);
});
