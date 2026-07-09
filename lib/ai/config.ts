// Purpose: Reads safe AI runtime knobs from environment variables without exposing secrets.
const DEFAULT_DAILY_TOKEN_LIMIT = 12000;
const DEFAULT_TEMPERATURE = 0.2;

export type AiRuntimeConfig = {
  dailyTokenLimit: number;
  enabled: boolean;
  temperature: number;
};

type AiEnv = {
  [key: string]: string | undefined;
};

function finiteNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getAiRuntimeConfig(
  env: AiEnv = process.env,
): AiRuntimeConfig {
  const dailyTokenLimit = Math.max(
    0,
    Math.floor(finiteNumber(env.AI_TOTAL_TOKEN_LIMIT, DEFAULT_DAILY_TOKEN_LIMIT)),
  );
  const temperature = Math.min(
    1,
    Math.max(0, finiteNumber(env.AI_TEMPERATURE, DEFAULT_TEMPERATURE)),
  );

  return {
    dailyTokenLimit,
    enabled: Boolean(env.OPENAI_API_KEY) && dailyTokenLimit > 0,
    temperature,
  };
}
