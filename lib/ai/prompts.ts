// Purpose: Assembles AI prompt payloads from normalized workspace context.
import type { PricingOutput } from "@/lib/workspace/pricing";
import type { WorkspaceAiContext } from "./context";

export type AiPromptMessage = {
  content: string;
  role: "system" | "user";
};

export type AiPromptBundle = {
  estimatedTokens: number;
  messages: AiPromptMessage[];
  purpose: "briefing" | "pricing";
};

function estimateTokens(text: string) {
  return Math.ceil(text.length / 4);
}

function bundle(purpose: AiPromptBundle["purpose"], messages: AiPromptMessage[]): AiPromptBundle {
  return {
    estimatedTokens: messages.reduce((sum, message) => sum + estimateTokens(message.content), 0),
    messages,
    purpose,
  };
}

export function buildBriefingPrompt(context: WorkspaceAiContext): AiPromptBundle {
  const metrics = context.metrics;
  const userContent = [
    `日期：${context.date}`,
    `简报类型：${context.type ?? "PLAN"}`,
    `未完成任务：${metrics.openTaskCount}`,
    `客服待处理：${metrics.openMessageCount}`,
    `订单风险：${metrics.riskyOrderCount}`,
    `待审批：${metrics.pendingApprovalCount}`,
    `待定价审批：${metrics.pendingPricingCount}`,
    `库存预警：${metrics.inventoryAlertCount}`,
    `重点任务：${context.highlights.openTasks.map((item) => item.title).join(" / ") || "无"}`,
    `风险订单：${context.highlights.orderRisks.map((item) => item.externalOrderId).join(" / ") || "无"}`,
  ].join("\n");

  return bundle("briefing", [
    {
      content:
        "你是 JPY 三人跨境电商团队的运营简报助手。只输出简洁中文，优先指出今天必须处理的风险、审批、客服和库存动作。",
      role: "system",
    },
    { content: userContent, role: "user" },
  ]);
}

export function buildPricingPrompt(input: {
  productName: string;
  sku: string;
  output: PricingOutput;
}): AiPromptBundle {
  return bundle("pricing", [
    {
      content:
        "你是跨境电商定价审核助手。只给负责人提供简短中文建议，不调用平台 API，不承诺利润，只解释风险和下一步动作。",
      role: "system",
    },
    {
      content: [
        `SKU：${input.sku || "未填写"}`,
        `商品：${input.productName || "未填写"}`,
        `最低不亏价：${input.output.minimumPrice}`,
        `建议售价：${input.output.suggestedPrice}`,
        `活动底价：${input.output.campaignFloorPrice}`,
        `预估毛利率：${Math.round(input.output.expectedGrossMarginRate * 1000) / 10}%`,
        `风险等级：${input.output.riskLevel}`,
      ].join("\n"),
      role: "user",
    },
  ]);
}
