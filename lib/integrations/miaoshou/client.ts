// Purpose: Reserves the Miaoshou ERP client boundary without making real API requests.
import { NotConfiguredError, checkRequiredEnv } from "../errors";
import type { MiaoshouIntegrationStatus } from "./types";

const envKeys = ["MIAOSHOU_API_KEY"];

export function getMiaoshouStatus(): MiaoshouIntegrationStatus {
  try {
    checkRequiredEnv("Miaoshou ERP", envKeys);
    return {
      configured: true,
      missingEnvKeys: [],
      provider: "Miaoshou ERP",
    };
  } catch (error) {
    if (error instanceof NotConfiguredError) {
      return {
        configured: false,
        missingEnvKeys: error.missingEnvKeys,
        provider: "Miaoshou ERP",
      };
    }

    throw error;
  }
}
