// Purpose: Seeds the JPY workspace with three team accounts and demo data for every MVP module.
import { ConnectionProvider, type Prisma } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";
import { prisma } from "../lib/db/prisma";

const defaultUsers = [
  {
    email: "owner@team.local",
    name: "负责人",
    password: "123456",
    role: "OWNER" as const,
  },
  {
    email: "operator@team.local",
    name: "运营",
    password: "123456",
    role: "OPERATOR" as const,
  },
  {
    email: "support@team.local",
    name: "客服与发货",
    password: "123456",
    role: "SUPPORT" as const,
  },
];

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

async function clearDemoData() {
  await prisma.auditLog.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.dailyBriefing.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.customerMessage.deleteMany();
  await prisma.messageTemplate.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.task.deleteMany();
  await prisma.order.deleteMany();
  await prisma.session.deleteMany();
}

async function seedUsers() {
  const users = new Map<string, Awaited<ReturnType<typeof prisma.user.upsert>>>();

  for (const user of defaultUsers) {
    const saved = await prisma.user.upsert({
      create: {
        email: user.email,
        name: user.name,
        passwordHash: await hashPassword(user.password),
        role: user.role,
      },
      update: {
        name: user.name,
        role: user.role,
        status: "ACTIVE",
      },
      where: {
        email: user.email,
      },
    });
    users.set(user.role, saved);
  }

  return {
    operator: users.get("OPERATOR")!,
    owner: users.get("OWNER")!,
    support: users.get("SUPPORT")!,
  };
}

async function seedConnections() {
  for (const provider of Object.values(ConnectionProvider)) {
    await prisma.apiConnection.upsert({
      create: {
        provider,
        displayName: provider.replaceAll("_", " "),
        status: provider === "SHOPEE" ? "KEY_REQUIRED" : "RESERVED",
      },
      update: {
        displayName: provider.replaceAll("_", " "),
        status: provider === "SHOPEE" ? "KEY_REQUIRED" : "RESERVED",
      },
      where: {
        provider,
      },
    });
  }
}

async function seedWorkspaceData(users: Awaited<ReturnType<typeof seedUsers>>) {
  const orderA = await prisma.order.create({
    data: {
      assigneeId: users.support.id,
      customerName: "Maria Santos",
      estimatedProfit: 5.6,
      externalOrderId: "SP-100245",
      platform: "SHOPEE",
      riskFlags: ["待发货快超时", "客户催发货"] as Prisma.InputJsonValue,
      riskLevel: "HIGH",
      skuCount: 2,
      status: "RISK",
      totalAmount: 38.9,
    },
  });
  const orderB = await prisma.order.create({
    data: {
      assigneeId: users.operator.id,
      customerName: "Aisyah Rahman",
      estimatedProfit: 2.1,
      externalOrderId: "SP-100246",
      platform: "SHOPEE",
      riskFlags: ["利润过低"] as Prisma.InputJsonValue,
      riskLevel: "MEDIUM",
      skuCount: 1,
      status: "PENDING_SHIPMENT",
      totalAmount: 12.5,
    },
  });
  const orderC = await prisma.order.create({
    data: {
      assigneeId: users.support.id,
      customerName: "Ken Tan",
      estimatedProfit: 8.2,
      externalOrderId: "SP-100247",
      platform: "SHOPEE",
      riskFlags: ["物流未更新"] as Prisma.InputJsonValue,
      riskLevel: "MEDIUM",
      skuCount: 3,
      status: "IN_TRANSIT",
      totalAmount: 56.4,
    },
  });

  const listingA = await prisma.listing.create({
    data: {
      cost: 18.2,
      currentStep: "核对标题和规格图",
      ownerId: users.operator.id,
      platform: "SHOPEE",
      sku: "JPY-BAG-001",
      status: "CONTENT",
      targetPrice: 39.9,
      title: "轻量通勤斜挎包",
    },
  });
  const listingB = await prisma.listing.create({
    data: {
      cost: 8.5,
      currentStep: "等待负责人确认活动价",
      ownerId: users.operator.id,
      platform: "SHOPEE",
      sku: "JPY-CASE-014",
      status: "APPROVAL",
      targetPrice: 19.9,
      title: "防摔手机壳组合",
    },
  });

  const pricingA = await prisma.pricingRule.create({
    data: {
      adCost: 1.2,
      campaignFloorPrice: 34.9,
      cost: 18.2,
      domesticShipping: 2.1,
      exchangeRate: 1,
      internationalShipping: 5.4,
      packagingCost: 0.8,
      paymentFeeRate: 0.022,
      platformFeeRate: 0.06,
      productName: "轻量通勤斜挎包",
      returnLossRate: 0.03,
      sku: "JPY-BAG-001",
      status: "PENDING_APPROVAL",
      submittedById: users.operator.id,
      suggestedPrice: 42.9,
      minimumPrice: 31.5,
      targetMarginRate: 0.22,
      taxReserveRate: 0.03,
    },
  });
  await prisma.pricingRule.create({
    data: {
      adCost: 0.5,
      campaignFloorPrice: 16.9,
      cost: 8.5,
      domesticShipping: 1.2,
      exchangeRate: 1,
      internationalShipping: 2.6,
      packagingCost: 0.4,
      paymentFeeRate: 0.022,
      platformFeeRate: 0.06,
      productName: "防摔手机壳组合",
      returnLossRate: 0.02,
      sku: "JPY-CASE-014",
      status: "DRAFT",
      submittedById: users.operator.id,
      suggestedPrice: 19.9,
      minimumPrice: 14.2,
      targetMarginRate: 0.2,
      taxReserveRate: 0.03,
    },
  });

  const messageA = await prisma.customerMessage.create({
    data: {
      aiDraft: "您好，我们已经在核对物流节点，会尽快给您更新处理结果。",
      assigneeId: users.support.id,
      customerName: "Maria Santos",
      dueAt: addDays(0),
      externalThreadId: "MSG-7781",
      message: "客户催促发货，并询问是否可以今天寄出。",
      platform: "SHOPEE",
      priority: "HIGH",
      relatedOrderId: orderA.id,
      status: "OPEN",
      subject: "客户催发货",
    },
  });
  await prisma.customerMessage.create({
    data: {
      aiDraft: "您好，活动价格需要再次确认，我们会在今天内回复您。",
      assigneeId: users.support.id,
      customerName: "Aisyah Rahman",
      dueAt: addDays(1),
      externalThreadId: "MSG-7782",
      message: "客户询问活动价和赠品。",
      platform: "SHOPEE",
      priority: "MEDIUM",
      relatedOrderId: orderB.id,
      status: "IN_PROGRESS",
      subject: "活动价咨询",
    },
  });

  await prisma.messageTemplate.createMany({
    data: [
      {
        category: "物流",
        contentEn: "Hi, we are checking the shipment status and will update you shortly.",
        contentZh: "您好，我们正在核对物流状态，会尽快给您更新。",
        title: "物流跟进",
      },
      {
        category: "售后",
        contentEn: "Sorry for the inconvenience. Please send us a photo so we can help further.",
        contentZh: "很抱歉给您带来不便，请发送照片，我们会继续协助处理。",
        title: "售后照片",
      },
      {
        category: "活动价",
        contentEn: "The promotion price is being confirmed. We will reply today.",
        contentZh: "活动价格正在确认中，我们会在今天内回复您。",
        title: "活动价确认",
      },
    ],
  });

  await prisma.inventoryItem.createMany({
    data: [
      {
        available: 8,
        incoming: 20,
        note: "低于安全库存，建议补货。",
        productName: "轻量通勤斜挎包",
        safetyStock: 15,
        sku: "JPY-BAG-001",
        status: "LOW_STOCK",
      },
      {
        available: 0,
        incoming: 0,
        note: "上架前需确认供应商交期。",
        productName: "防摔手机壳组合",
        safetyStock: 25,
        sku: "JPY-CASE-014",
        status: "OUT_OF_STOCK",
      },
      {
        available: 86,
        incoming: 40,
        note: "库存正常。",
        productName: "桌面收纳盒",
        safetyStock: 30,
        sku: "JPY-BOX-008",
        status: "NORMAL",
      },
    ],
  });

  const approvalA = await prisma.approval.create({
    data: {
      approverId: users.owner.id,
      description: "运营提交 Shopee 活动价，需要确认最低不亏价和活动底价。",
      relatedId: pricingA.id,
      relatedType: "PricingRule",
      requestedById: users.operator.id,
      status: "PENDING",
      title: "审批 JPY-BAG-001 活动价",
      type: "PRICING",
    },
  });
  await prisma.approval.create({
    data: {
      approverId: users.owner.id,
      description: "客户催发货且订单快超时，需要负责人确认是否优先处理。",
      relatedId: messageA.id,
      relatedType: "CustomerMessage",
      requestedById: users.support.id,
      status: "PENDING",
      title: "客户催发货升级",
      type: "MESSAGE_ESCALATION",
    },
  });
  await prisma.approval.create({
    data: {
      approverId: users.owner.id,
      description: "库存低于安全线，建议采购 50 件。",
      relatedId: "JPY-BAG-001",
      relatedType: "InventoryItem",
      requestedById: users.operator.id,
      status: "PENDING",
      title: "低库存补货确认",
      type: "INVENTORY_PURCHASE",
    },
  });

  await prisma.task.createMany({
    data: [
      {
        assigneeId: users.operator.id,
        createdById: users.owner.id,
        description: "检查 JPY-BAG-001 标题、图片、规格和价格字段。",
        dueAt: addDays(0),
        platform: "SHOPEE",
        priority: "HIGH",
        relatedId: listingA.id,
        relatedType: "Listing",
        status: "DOING",
        title: "完成斜挎包上架资料",
      },
      {
        assigneeId: users.support.id,
        createdById: users.owner.id,
        description: "回复 Maria Santos 催发货消息，并同步发货状态。",
        dueAt: addDays(0),
        platform: "SHOPEE",
        priority: "URGENT",
        relatedId: messageA.id,
        relatedType: "CustomerMessage",
        status: "TODO",
        title: "处理客户催发货",
      },
      {
        assigneeId: users.owner.id,
        createdById: users.operator.id,
        description: "审批 JPY-BAG-001 的活动价格。",
        dueAt: addDays(1),
        platform: "SHOPEE",
        priority: "HIGH",
        relatedId: approvalA.id,
        relatedType: "Approval",
        status: "REVIEW",
        title: "审批活动定价",
      },
      {
        assigneeId: users.operator.id,
        createdById: users.support.id,
        description: "核对订单 SP-100246 利润过低原因。",
        dueAt: addDays(2),
        platform: "SHOPEE",
        priority: "MEDIUM",
        relatedId: orderB.id,
        relatedType: "Order",
        status: "TODO",
        title: "复核低利润订单",
      },
    ],
  });

  const todayBriefing = {
    completedTasks: 0,
    focus: ["处理催发货消息", "审批活动定价", "确认低库存补货"],
    inventoryAlerts: ["JPY-BAG-001", "JPY-CASE-014"],
    orderRisks: ["SP-100245", "SP-100246"],
    pendingApprovals: ["审批 JPY-BAG-001 活动价", "客户催发货升级"],
    tomorrowSuggestion: "优先把库存、定价和客服升级事项闭环。",
  } satisfies Prisma.InputJsonObject;

  await prisma.dailyBriefing.create({
    data: {
      contentJson: todayBriefing,
      createdById: users.owner.id,
      date: startOfToday(),
      type: "PLAN",
    },
  });

  await prisma.activity.createMany({
    data: [
      {
        action: "seed",
        content: "创建演示订单 SP-100245，并标记为高风险。",
        entityId: orderA.id,
        entityType: "Order",
        userId: users.owner.id,
      },
      {
        action: "seed",
        content: "创建客服消息：客户催发货。",
        entityId: messageA.id,
        entityType: "CustomerMessage",
        userId: users.support.id,
      },
      {
        action: "seed",
        content: "创建商品上架流程：轻量通勤斜挎包。",
        entityId: listingA.id,
        entityType: "Listing",
        userId: users.operator.id,
      },
      {
        action: "seed",
        content: "提交定价审批，等待负责人确认。",
        entityId: pricingA.id,
        entityType: "PricingRule",
        userId: users.operator.id,
      },
      {
        action: "seed",
        content: "创建审批事项：客户催发货升级。",
        entityId: approvalA.id,
        entityType: "Approval",
        userId: users.support.id,
      },
      {
        action: "seed",
        content: "创建商品上架流程：防摔手机壳组合。",
        entityId: listingB.id,
        entityType: "Listing",
        userId: users.operator.id,
      },
      {
        action: "seed",
        content: "订单物流未更新，需要客服持续跟进。",
        entityId: orderC.id,
        entityType: "Order",
        userId: users.support.id,
      },
    ],
  });
}

async function main() {
  await clearDemoData();
  const users = await seedUsers();
  await seedConnections();
  await seedWorkspaceData(users);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
