// Purpose: Builds compact database context for AI prompts and rule-based fallbacks.
import type {
  Approval,
  CustomerMessage,
  DailyBriefingType,
  InventoryItem,
  Order,
  PricingRule,
  Task,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type WorkspaceAiContext = {
  date: string;
  highlights: {
    inventoryAlerts: Pick<InventoryItem, "productName" | "sku" | "status">[];
    openMessages: Pick<CustomerMessage, "priority" | "subject">[];
    openTasks: Pick<Task, "priority" | "title">[];
    orderRisks: Pick<Order, "externalOrderId" | "riskLevel" | "status">[];
    pendingApprovals: Pick<Approval, "title" | "type">[];
    pendingPricing: Pick<PricingRule, "productName" | "sku" | "suggestedPrice">[];
  };
  metrics: {
    completedTasksToday: number;
    inventoryAlertCount: number;
    openMessageCount: number;
    openTaskCount: number;
    pendingApprovalCount: number;
    pendingPricingCount: number;
    riskyOrderCount: number;
  };
  type?: DailyBriefingType;
};

export async function getWorkspaceAiContext(
  date = new Date(),
  type?: DailyBriefingType,
): Promise<WorkspaceAiContext> {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [
    completedTasksToday,
    openTasks,
    openTaskCount,
    openMessages,
    openMessageCount,
    orderRisks,
    riskyOrderCount,
    pendingApprovals,
    pendingApprovalCount,
    pendingPricing,
    pendingPricingCount,
    inventoryAlerts,
    inventoryAlertCount,
  ] = await Promise.all([
    prisma.task.count({ where: { completedAt: { gte: start, lt: end } } }),
    prisma.task.findMany({
      orderBy: [{ priority: "desc" }, { dueAt: "asc" }],
      select: { priority: true, title: true },
      take: 8,
      where: { status: { not: "DONE" } },
    }),
    prisma.task.count({ where: { status: { not: "DONE" } } }),
    prisma.customerMessage.findMany({
      orderBy: [{ priority: "desc" }, { dueAt: "asc" }],
      select: { priority: true, subject: true },
      take: 6,
      where: { status: { not: "RESOLVED" } },
    }),
    prisma.customerMessage.count({ where: { status: { not: "RESOLVED" } } }),
    prisma.order.findMany({
      orderBy: [{ riskLevel: "desc" }, { updatedAt: "desc" }],
      select: { externalOrderId: true, riskLevel: true, status: true },
      take: 6,
      where: { OR: [{ status: "RISK" }, { riskLevel: { in: ["HIGH", "CRITICAL"] } }] },
    }),
    prisma.order.count({
      where: { OR: [{ status: "RISK" }, { riskLevel: { in: ["HIGH", "CRITICAL"] } }] },
    }),
    prisma.approval.findMany({
      orderBy: { createdAt: "desc" },
      select: { title: true, type: true },
      take: 6,
      where: { status: "PENDING" },
    }),
    prisma.approval.count({ where: { status: "PENDING" } }),
    prisma.pricingRule.findMany({
      orderBy: { updatedAt: "desc" },
      select: { productName: true, sku: true, suggestedPrice: true },
      take: 6,
      where: { status: "PENDING_APPROVAL" },
    }),
    prisma.pricingRule.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.inventoryItem.findMany({
      orderBy: { updatedAt: "desc" },
      select: { productName: true, sku: true, status: true },
      take: 6,
      where: { status: { in: ["LOW_STOCK", "OUT_OF_STOCK", "RESTOCK_SUGGESTED"] } },
    }),
    prisma.inventoryItem.count({
      where: { status: { in: ["LOW_STOCK", "OUT_OF_STOCK", "RESTOCK_SUGGESTED"] } },
    }),
  ]);

  return {
    date: start.toISOString().slice(0, 10),
    highlights: {
      inventoryAlerts,
      openMessages,
      openTasks,
      orderRisks,
      pendingApprovals,
      pendingPricing,
    },
    metrics: {
      completedTasksToday,
      inventoryAlertCount,
      openMessageCount,
      openTaskCount,
      pendingApprovalCount,
      pendingPricingCount,
      riskyOrderCount,
    },
    type,
  };
}
