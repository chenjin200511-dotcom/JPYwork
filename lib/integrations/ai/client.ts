// Purpose: Reserves the AI client boundary without making real API requests.
import { NotConfiguredError, checkRequiredEnv } from "../errors";
import type { AiIntegrationStatus } from "./types";

const envKeys = ["OPENAI_API_KEY"];

export function getAiStatus(): AiIntegrationStatus {
  try {
    checkRequiredEnv("AI", envKeys);
    return {
      configured: true,
      missingEnvKeys: [],
      provider: "AI",
    };
  } catch (error) {
    if (error instanceof NotConfiguredError) {
      return {
        configured: false,
        missingEnvKeys: error.missingEnvKeys,
        provider: "AI",
      };
    }

    throw error;
  }
}
