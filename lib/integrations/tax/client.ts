// Purpose: Reserves the tax export boundary without connecting to tax systems.
import { NotConfiguredError, checkRequiredEnv } from "../errors";
import type { FinanceTaxPlaceholder, TaxIntegrationStatus } from "./types";

const envKeys = ["TAX_EXPORT_KEY"];

export function getTaxStatus(): TaxIntegrationStatus {
  try {
    checkRequiredEnv("Tax", envKeys);
    return {
      configured: true,
      missingEnvKeys: [],
      provider: "Tax",
    };
  } catch (error) {
    if (error instanceof NotConfiguredError) {
      return {
        configured: false,
        missingEnvKeys: error.missingEnvKeys,
        provider: "Tax",
      };
    }

    throw error;
  }
}

export function getFinanceTaxPlaceholder(): FinanceTaxPlaceholder {
  return {
    disclaimer:
      "Reserved reporting support only. This system does not automate tax filing.",
    exports: ["profit-report", "platform-reconciliation", "tax-package"],
    reports: ["profit", "payments", "withdrawals", "China tax preparation"],
  };
}
