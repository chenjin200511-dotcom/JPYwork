// Purpose: Returns authenticated dashboard summary aggregated from workspace records.
import { handleApiError } from "@/lib/api/errors";
import { apiSuccess } from "@/lib/api/response";
import { requirePermission } from "@/lib/api/authGuard";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requirePermission("dashboard.view", "Dashboard");
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const userTaskScope = user.role === "SUPPORT" ? { assigneeId: user.id } : {};

    const [
      myTasks,
      overdueTasks,
      messagesWaiting,
      orderRisks,
      listingsInProgress,
      pendingPricing,
      pendingApprovals,
      inventoryAlerts,
      recentActivities,
      todayBriefing,
    ] = await Promise.all([
      prisma.task.count({
        where: {
          ...userTaskScope,
          status: { not: "DONE" },
        },
      }),
      prisma.task.count({
        where: {
          ...userTaskScope,
          dueAt: { lt: new Date() },
          status: { not: "DONE" },
        },
      }),
      prisma.customerMessage.count({
        where: { status: { not: "RESOLVED" } },
      }),
      prisma.order.count({
        where: {
          OR: [{ status: "RISK" }, { riskLevel: { in: ["HIGH", "CRITICAL"] } }],
        },
      }),
      prisma.listing.count({
        where: { status: { notIn: ["PUBLISHED"] } },
      }),
      prisma.pricingRule.count({
        where: { status: "PENDING_APPROVAL" },
      }),
      prisma.approval.count({
        where: { status: "PENDING" },
      }),
      prisma.inventoryItem.count({
        where: { status: { in: ["LOW_STOCK", "OUT_OF_STOCK", "RESTOCK_SUGGESTED"] } },
      }),
      prisma.activity.findMany({
        include: {
          user: { select: { email: true, id: true, name: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.dailyBriefing.findFirst({
        orderBy: { createdAt: "desc" },
        where: {
          date: { gte: startOfToday },
        },
      }),
    ]);

    return apiSuccess({
      inventoryAlerts,
      listingsInProgress,
      messagesWaiting,
      myTasks,
      orderRisks,
      overdueTasks,
      pendingApprovals,
      pendingPricing,
      recentActivities,
      todayBriefing,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
