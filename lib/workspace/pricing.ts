// Purpose: Calculates pricing outputs for JPY approval workflows.
export type PricingInput = {
  adCost: number;
  cost: number;
  domesticShipping: number;
  exchangeRate: number;
  internationalShipping: number;
  packagingCost: number;
  paymentFeeRate: number;
  platformFeeRate: number;
  returnLossRate: number;
  targetMarginRate: number;
  taxReserveRate: number;
};

export type PricingOutput = {
  campaignFloorPrice: number;
  expectedGrossProfit: number;
  expectedGrossMarginRate: number;
  minimumPrice: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  suggestedPrice: number;
  totalCost: number;
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculatePricing(input: PricingInput): PricingOutput {
  const exchangeRate = input.exchangeRate || 1;
  const baseCost =
    input.cost +
    input.domesticShipping +
    input.internationalShipping +
    input.packagingCost +
    input.adCost;
  const variableRate =
    input.platformFeeRate +
    input.paymentFeeRate +
    input.returnLossRate +
    input.taxReserveRate;
  const denominator = Math.max(0.01, 1 - variableRate);
  const minimumPrice = (baseCost / denominator) * exchangeRate;
  const suggestedPrice = minimumPrice / Math.max(0.01, 1 - input.targetMarginRate);
  const campaignFloorPrice = minimumPrice * 1.04;
  const expectedGrossProfit = suggestedPrice - minimumPrice;
  const expectedGrossMarginRate =
    suggestedPrice > 0 ? expectedGrossProfit / suggestedPrice : 0;
  const riskLevel =
    expectedGrossMarginRate < 0.12 ? "HIGH" : expectedGrossMarginRate < 0.2 ? "MEDIUM" : "LOW";

  return {
    campaignFloorPrice: roundMoney(campaignFloorPrice),
    expectedGrossProfit: roundMoney(expectedGrossProfit),
    expectedGrossMarginRate: Math.round(expectedGrossMarginRate * 10000) / 10000,
    minimumPrice: roundMoney(minimumPrice),
    riskLevel,
    suggestedPrice: roundMoney(suggestedPrice),
    totalCost: roundMoney(baseCost),
  };
}
