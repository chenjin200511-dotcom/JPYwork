// Purpose: Generates AI-ready daily briefings with deterministic rule-based fallback.
import type { DailyBriefingType } from "@prisma/client";
import {
  prepareCopilotBriefing,
  type CopilotBriefingResult,
} from "@/lib/ai/copilot";
import type { WorkspaceAiContext } from "@/lib/ai/context";

export type DailyBriefingContent = {
  aiCopilot: {
    dailyTokenLimit: number;
    estimatedPromptTokens: number;
    mode: CopilotBriefingResult<unknown>["mode"];
    reason?: string;
    temperature: number;
  };
  completedTasks: number;
  date: string;
  focus: string[];
  inventoryAlerts: string[];
  openMessages: string[];
  openTasks: string[];
  orderRisks: string[];
  pendingApprovals: string[];
  pendingPricing: string[];
  summary: string;
  tomorrowSuggestion: string;
  type: DailyBriefingType;
};

function ruleBasedBriefing(
  context: WorkspaceAiContext,
  type: DailyBriefingType,
): Omit<DailyBriefingContent, "aiCopilot"> {
  const metrics = context.metrics;
  const focus = [
    metrics.pendingApprovalCount > 0
      ? `先处理 ${metrics.pendingApprovalCount} 个待审批事项，避免运营节奏卡住。`
      : "今天没有堆积审批，优先推进上架、定价和客服收尾。",
    metrics.openMessageCount > 0
      ? `客服还有 ${metrics.openMessageCount} 条待处理消息，优先关闭高优先级售后。`
      : "客服消息暂时平稳，继续保持响应时效。",
    metrics.inventoryAlertCount > 0
      ? `库存预警 ${metrics.inventoryAlertCount} 个，需要确认补货、暂停活动或调整价格。`
      : "库存风险较低，可以继续推进刊登和活动定价。",
  ];

  return {
    completedTasks: metrics.completedTasksToday,
    date: context.date,
    focus,
    inventoryAlerts: context.highlights.inventoryAlerts.map(
      (item) => `${item.sku} / ${item.productName} / ${item.status}`,
    ),
    openMessages: context.highlights.openMessages.map(
      (message) => `${message.priority} / ${message.subject}`,
    ),
    openTasks: context.highlights.openTasks.map((task) => `${task.priority} / ${task.title}`),
    orderRisks: context.highlights.orderRisks.map(
      (order) => `${order.externalOrderId} / ${order.status} / ${order.riskLevel}`,
    ),
    pendingApprovals: context.highlights.pendingApprovals.map(
      (approval) => `${approval.type} / ${approval.title}`,
    ),
    pendingPricing: context.highlights.pendingPricing.map(
      (pricing) => `${pricing.sku} / ${pricing.productName} / ${pricing.suggestedPrice}`,
    ),
    summary:
      type === "PLAN"
        ? `今日简报已根据任务、客服、订单、审批、定价和库存状态生成。当前有 ${metrics.riskyOrderCount} 个订单风险、${metrics.pendingPricingCount} 个待定价审批。`
        : `晚间复盘已根据今日完成事项和未完成风险生成。今日完成 ${metrics.completedTasksToday} 个任务。`,
    tomorrowSuggestion:
      metrics.riskyOrderCount > 0
        ? "明天先处理仍未关闭的高风险订单，再推进刊登、补货和活动定价。"
        : "明天优先清理待审批与客服尾巴，再推进新增商品和定价复盘。",
    type,
  };
}

export async function generateBriefingContent(date: Date, type: DailyBriefingType) {
  const result = await prepareCopilotBriefing({
    date,
    fallback: (context) => ruleBasedBriefing(context, type),
    type,
  });

  return {
    ...result.content,
    aiCopilot: {
      dailyTokenLimit: result.config.dailyTokenLimit,
      estimatedPromptTokens: result.prompt.estimatedTokens,
      mode: result.mode,
      reason: result.reason,
      temperature: result.config.temperature,
    },
  } satisfies DailyBriefingContent;
}
