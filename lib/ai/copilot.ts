// Purpose: Coordinates AI prompt preparation, cost guards, and rule-based fallback behavior.
import type { DailyBriefingType } from "@prisma/client";
import { getAiRuntimeConfig, type AiRuntimeConfig } from "./config";
import { getWorkspaceAiContext, type WorkspaceAiContext } from "./context";
import { buildBriefingPrompt, type AiPromptBundle } from "./prompts";

export type AiGuardResult =
  | { allowed: true }
  | { allowed: false; reason: "AI_DISABLED" | "AI_TOKEN_LIMIT" };

export type CopilotBriefingResult<TContent> = {
  config: AiRuntimeConfig;
  content: TContent;
  context: WorkspaceAiContext;
  mode: "ai-ready" | "rule-based";
  prompt: AiPromptBundle;
  reason?: "AI_DISABLED" | "AI_TOKEN_LIMIT";
};

export function evaluateAiGuard(
  prompt: AiPromptBundle,
  config = getAiRuntimeConfig(),
  tokensUsedToday = 0,
): AiGuardResult {
  if (!config.enabled) {
    return { allowed: false, reason: "AI_DISABLED" };
  }

  if (tokensUsedToday + prompt.estimatedTokens > config.dailyTokenLimit) {
    return { allowed: false, reason: "AI_TOKEN_LIMIT" };
  }

  return { allowed: true };
}

export async function prepareCopilotBriefing<TContent>(input: {
  date: Date;
  fallback: (context: WorkspaceAiContext) => Promise<TContent> | TContent;
  tokensUsedToday?: number;
  type: DailyBriefingType;
}): Promise<CopilotBriefingResult<TContent>> {
  const context = await getWorkspaceAiContext(input.date, input.type);
  const prompt = buildBriefingPrompt(context);
  const config = getAiRuntimeConfig();
  const guard = evaluateAiGuard(prompt, config, input.tokensUsedToday ?? 0);

  // Paid AI calls are intentionally not made in MVP. This keeps the prompt boundary ready
  // while guaranteeing the system falls back to deterministic database-based text.
  const content = await input.fallback(context);

  return {
    config,
    content,
    context,
    mode: guard.allowed ? "ai-ready" : "rule-based",
    prompt,
    reason: guard.allowed ? undefined : guard.reason,
  };
}
