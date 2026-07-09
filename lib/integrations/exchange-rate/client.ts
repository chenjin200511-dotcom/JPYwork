// Purpose: Reserves the exchange-rate client boundary without making real API requests.
import { NotConfiguredError, checkRequiredEnv } from "../errors";
import type { ExchangeRateIntegrationStatus } from "./types";

const envKeys = ["EXCHANGE_RATE_API_KEY"];

export function getExchangeRateStatus(): ExchangeRateIntegrationStatus {
  try {
    checkRequiredEnv("Exchange Rate", envKeys);
    return {
      configured: true,
      missingEnvKeys: [],
      provider: "Exchange Rate",
    };
  } catch (error) {
    if (error instanceof NotConfiguredError) {
      return {
        configured: false,
        missingEnvKeys: error.missingEnvKeys,
        provider: "Exchange Rate",
      };
    }

    throw error;
  }
}
