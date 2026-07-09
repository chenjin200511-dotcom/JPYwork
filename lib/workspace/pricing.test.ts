import assert from "node:assert/strict";
import test from "node:test";
import { calculatePricing } from "./pricing";

test("pricing calculator keeps empty draft metrics finite", () => {
  const output = calculatePricing({
    adCost: 0,
    cost: 0,
    domesticShipping: 0,
    exchangeRate: 1,
    internationalShipping: 0,
    packagingCost: 0,
    paymentFeeRate: 0.03,
    platformFeeRate: 0.08,
    returnLossRate: 0.02,
    targetMarginRate: 0.2,
    taxReserveRate: 0,
  });

  assert.equal(Number.isFinite(output.expectedGrossMarginRate), true);
  assert.equal(output.expectedGrossMarginRate, 0);
});
