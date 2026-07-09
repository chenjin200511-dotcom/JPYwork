// Purpose: Reserves the TikTok Shop client boundary without making real API requests.
import { NotConfiguredError, checkRequiredEnv } from "../errors";
import type { TiktokIntegrationStatus } from "./types";

const envKeys = ["TIKTOK_APP_KEY", "TIKTOK_APP_SECRET"];

export function getTiktokStatus(): TiktokIntegrationStatus {
  try {
    checkRequiredEnv("TikTok Shop", envKeys);
    return {
      configured: true,
      missingEnvKeys: [],
      provider: "TikTok Shop",
    };
  } catch (error) {
    if (error instanceof NotConfiguredError) {
      return {
        configured: false,
        missingEnvKeys: error.missingEnvKeys,
        provider: "TikTok Shop",
      };
    }

    throw error;
  }
}
