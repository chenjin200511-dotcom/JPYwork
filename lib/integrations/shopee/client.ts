// Purpose: Reserves the Shopee client boundary without making real API requests.
import { NotConfiguredError, checkRequiredEnv } from "../errors";
import type { ShopeeIntegrationStatus } from "./types";

const envKeys = ["SHOPEE_CLIENT_ID", "SHOPEE_CLIENT_SECRET"];

export function getShopeeStatus(): ShopeeIntegrationStatus {
  try {
    checkRequiredEnv("Shopee", envKeys);
    return {
      configured: true,
      missingEnvKeys: [],
      provider: "Shopee",
    };
  } catch (error) {
    if (error instanceof NotConfiguredError) {
      return {
        configured: false,
        missingEnvKeys: error.missingEnvKeys,
        provider: "Shopee",
      };
    }

    throw error;
  }
}
