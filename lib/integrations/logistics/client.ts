// Purpose: Reserves the logistics client boundary without making real API requests.
import { NotConfiguredError, checkRequiredEnv } from "../errors";
import type { LogisticsIntegrationStatus } from "./types";

const envKeys = ["LOGISTICS_API_KEY"];

export function getLogisticsStatus(): LogisticsIntegrationStatus {
  try {
    checkRequiredEnv("Logistics", envKeys);
    return {
      configured: true,
      missingEnvKeys: [],
      provider: "Logistics",
    };
  } catch (error) {
    if (error instanceof NotConfiguredError) {
      return {
        configured: false,
        missingEnvKeys: error.missingEnvKeys,
        provider: "Logistics",
      };
    }

    throw error;
  }
}
