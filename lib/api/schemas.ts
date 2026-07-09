// Purpose: Defines shared Zod schemas for protected JPY workspace API routes.
import { z } from "zod";

export const languageSchema = z.enum(["zh", "en"]);
export const platformSchema = z.enum(["SHOPEE", "TIKTOK", "MIAOSHOU", "INTERNAL"]);
export const prioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export const taskStatusSchema = z.enum(["TODO", "DOING", "REVIEW", "DONE"]);
export const messageStatusSchema = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "WAITING_OWNER",
  "RESOLVED",
]);
export const orderStatusSchema = z.enum([
  "NEW",
  "PENDING_SHIPMENT",
  "SHIPPED",
  "IN_TRANSIT",
  "DELIVERED",
  "AFTER_SALES",
  "CANCELLED",
  "RISK",
]);
export const riskLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export const listingStatusSchema = z.enum([
  "IDEA",
  "PRICING",
  "CONTENT",
  "INVENTORY_CHECK",
  "APPROVAL",
  "READY_TO_PUBLISH",
  "PUBLISHED",
  "ERROR",
]);
export const pricingStatusSchema = z.enum([
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
]);
export const approvalStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export const approvalTypeSchema = z.enum([
  "PRICING",
  "REFUND",
  "RESHIPMENT",
  "LISTING_PUBLISH",
  "ORDER_RISK",
  "MESSAGE_ESCALATION",
  "INVENTORY_PURCHASE",
]);
export const inventoryStatusSchema = z.enum([
  "NORMAL",
  "LOW_STOCK",
  "OUT_OF_STOCK",
  "RESTOCK_SUGGESTED",
  "PAUSED_PROMOTION",
]);
export const briefingTypeSchema = z.enum(["PLAN", "REVIEW"]);
export const connectionProviderSchema = z.enum([
  "SHOPEE",
  "TIKTOK",
  "MIAOSHOU",
  "AI",
  "EXCHANGE_RATE",
  "PAYMENT",
  "LOGISTICS",
  "TAX",
]);
export const connectionStatusSchema = z.enum([
  "NOT_CONNECTED",
  "RESERVED",
  "KEY_REQUIRED",
  "CONNECTED",
  "ERROR",
]);
export const webhookSourceSchema = z.enum([
  "BROWSER_EXTENSION",
  "MIAOSHOU",
  "SHOPEE",
  "MANUAL",
]);

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
  rememberDevice: z.boolean().default(false),
});

export const contentQuerySchema = z.object({
  key: z.enum(["site", "workspace", "theme"]).default("site"),
  language: languageSchema.default("zh"),
});

export const contentVersionSchema = z.object({
  contentJson: z.record(z.string(), z.unknown()),
  key: z.enum(["site", "workspace", "theme"]),
  language: z.union([languageSchema, z.literal("neutral")]),
});

export const contentRouteQuerySchema = z.object({
  lang: z.union([languageSchema, z.literal("neutral")]).default("zh"),
});

export const contentRouteUpdateSchema = z.object({
  contentJson: z.record(z.string(), z.unknown()),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
});

export const idParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const deleteByIdSchema = idParamSchema;

export const taskListQuerySchema = paginationQuerySchema.extend({
  assigneeId: z.string().trim().min(1).optional(),
  mine: z.coerce.boolean().optional(),
  platform: platformSchema.optional(),
  priority: prioritySchema.optional(),
  status: taskStatusSchema.optional(),
});

export const createTaskSchema = z.object({
  assigneeId: z.string().trim().min(1).nullable().optional(),
  description: z.string().trim().max(3000).nullable().optional(),
  dueAt: z.string().datetime().nullable().optional(),
  platform: platformSchema.default("INTERNAL"),
  priority: prioritySchema.default("MEDIUM"),
  relatedId: z.string().trim().min(1).nullable().optional(),
  relatedType: z.string().trim().max(80).nullable().optional(),
  status: taskStatusSchema.default("TODO"),
  title: z.string().trim().min(1).max(180),
});

export const patchTaskBodySchema = createTaskSchema.partial();
export const updateTaskSchema = patchTaskBodySchema.extend({
  id: z.string().trim().min(1),
});

export const messageListQuerySchema = paginationQuerySchema.extend({
  assigneeId: z.string().trim().min(1).optional(),
  platform: platformSchema.optional(),
  priority: prioritySchema.optional(),
  status: messageStatusSchema.optional(),
});

export const createMessageSchema = z.object({
  aiDraft: z.string().trim().max(3000).nullable().optional(),
  assigneeId: z.string().trim().min(1).nullable().optional(),
  customerName: z.string().trim().min(1).max(160),
  dueAt: z.string().datetime().nullable().optional(),
  externalThreadId: z.string().trim().max(160).nullable().optional(),
  lastReplyAt: z.string().datetime().nullable().optional(),
  message: z.string().trim().min(1).max(6000),
  platform: platformSchema.default("SHOPEE"),
  priority: prioritySchema.default("MEDIUM"),
  relatedOrderId: z.string().trim().min(1).nullable().optional(),
  status: messageStatusSchema.default("OPEN"),
  subject: z.string().trim().min(1).max(180),
});

export const patchMessageSchema = createMessageSchema.partial();
export const messageNoteSchema = z.object({
  content: z.string().trim().min(1).max(3000),
});
export const messageEscalateSchema = z.object({
  note: z.string().trim().max(3000).optional(),
});

export const createMessageTemplateSchema = z.object({
  category: z.string().trim().min(1).max(80),
  contentEn: z.string().trim().min(1).max(3000),
  contentZh: z.string().trim().min(1).max(3000),
  title: z.string().trim().min(1).max(120),
});

export const orderListQuerySchema = paginationQuerySchema.extend({
  assigneeId: z.string().trim().min(1).optional(),
  platform: platformSchema.optional(),
  riskLevel: riskLevelSchema.optional(),
  status: orderStatusSchema.optional(),
});

export const createOrderSchema = z.object({
  assigneeId: z.string().trim().min(1).nullable().optional(),
  customerName: z.string().trim().min(1).max(160),
  estimatedProfit: z.number().nullable().optional(),
  externalOrderId: z.string().trim().min(1).max(120),
  platform: platformSchema.default("SHOPEE"),
  riskFlags: z.array(z.string().trim().min(1)).default([]),
  riskLevel: riskLevelSchema.default("LOW"),
  skuCount: z.number().int().min(0).default(0),
  status: orderStatusSchema.default("PENDING_SHIPMENT"),
  totalAmount: z.number().nullable().optional(),
});

export const patchOrderBodySchema = createOrderSchema.partial();
export const updateOrderSchema = patchOrderBodySchema.extend({
  id: z.string().trim().min(1),
});

export const listingListQuerySchema = paginationQuerySchema.extend({
  ownerId: z.string().trim().min(1).optional(),
  platform: platformSchema.optional(),
  status: listingStatusSchema.optional(),
});

export const createListingSchema = z.object({
  cost: z.number().nonnegative().nullable().optional(),
  currentStep: z.string().trim().max(160).nullable().optional(),
  ownerId: z.string().trim().min(1).nullable().optional(),
  platform: platformSchema.default("SHOPEE"),
  sku: z.string().trim().min(1).max(120),
  status: listingStatusSchema.default("IDEA"),
  targetPrice: z.number().nonnegative().nullable().optional(),
  title: z.string().trim().min(1).max(180),
});

export const patchListingSchema = createListingSchema.partial();

export const pricingListQuerySchema = paginationQuerySchema.extend({
  sku: z.string().trim().min(1).optional(),
  status: pricingStatusSchema.optional(),
});

export const createPricingRuleSchema = z.object({
  adCost: z.number().nonnegative().default(0),
  campaignFloorPrice: z.number().nonnegative().optional(),
  cost: z.number().nonnegative(),
  domesticShipping: z.number().nonnegative().default(0),
  exchangeRate: z.number().positive().default(1),
  internationalShipping: z.number().nonnegative().default(0),
  packagingCost: z.number().nonnegative().default(0),
  paymentFeeRate: z.number().min(0).max(1).default(0),
  platformFeeRate: z.number().min(0).max(1).default(0),
  productName: z.string().trim().min(1).max(180),
  returnLossRate: z.number().min(0).max(1).default(0),
  sku: z.string().trim().min(1).max(120),
  status: pricingStatusSchema.default("DRAFT"),
  suggestedPrice: z.number().nonnegative().optional(),
  targetMarginRate: z.number().min(0).max(1).default(0.2),
  taxReserveRate: z.number().min(0).max(1).default(0),
});

export const patchPricingRuleBodySchema = createPricingRuleSchema.partial().extend({
  approvedById: z.string().trim().min(1).nullable().optional(),
});

export const updatePricingRuleSchema = patchPricingRuleBodySchema.extend({
  id: z.string().trim().min(1),
});

export const pricingDecisionSchema = z.object({
  note: z.string().trim().max(3000).optional(),
});

export const approvalListQuerySchema = paginationQuerySchema.extend({
  requestedById: z.string().trim().min(1).optional(),
  status: approvalStatusSchema.optional(),
  type: approvalTypeSchema.optional(),
});

export const createApprovalSchema = z.object({
  approverId: z.string().trim().min(1).nullable().optional(),
  description: z.string().trim().max(3000).nullable().optional(),
  relatedId: z.string().trim().min(1).nullable().optional(),
  relatedType: z.string().trim().max(80).nullable().optional(),
  requestedById: z.string().trim().min(1).nullable().optional(),
  status: approvalStatusSchema.default("PENDING"),
  title: z.string().trim().min(1).max(180),
  type: approvalTypeSchema,
});

export const approvalDecisionSchema = z.object({
  decisionNote: z.string().trim().max(3000).optional(),
});

export const inventoryListQuerySchema = paginationQuerySchema.extend({
  status: inventoryStatusSchema.optional(),
});

export const createInventorySchema = z.object({
  available: z.number().int().min(0).default(0),
  incoming: z.number().int().min(0).default(0),
  note: z.string().trim().max(2000).nullable().optional(),
  productName: z.string().trim().min(1).max(180),
  safetyStock: z.number().int().min(0).default(0),
  sku: z.string().trim().min(1).max(120),
  status: inventoryStatusSchema.optional(),
});

export const patchInventorySchema = createInventorySchema.partial();

export const activityListQuerySchema = paginationQuerySchema.extend({
  entityId: z.string().trim().min(1).optional(),
  entityType: z.string().trim().min(1).optional(),
});

export const createActivitySchema = z.object({
  action: z.string().trim().min(1).max(120).default("note"),
  content: z.string().trim().min(1).max(3000),
  entityId: z.string().trim().min(1),
  entityType: z.string().trim().min(1).max(80),
});

export const briefingListQuerySchema = paginationQuerySchema.extend({
  date: z.string().trim().optional(),
  type: briefingTypeSchema.optional(),
});

export const updateBriefingSchema = z.object({
  contentJson: z.record(z.string(), z.unknown()),
});

export const generateBriefingSchema = z.object({
  date: z.string().trim().optional(),
  type: briefingTypeSchema.default("PLAN"),
});

export const connectionListQuerySchema = paginationQuerySchema.extend({
  provider: connectionProviderSchema.optional(),
  status: connectionStatusSchema.optional(),
});

export const updateConnectionSchema = z
  .object({
    provider: connectionProviderSchema,
    status: connectionStatusSchema,
  })
  .strict();

export const csvImportSchema = z.object({
  csv: z.string().trim().min(1),
});

export const webhookOrderSchema = createOrderSchema
  .extend({
    idempotencyKey: z.string().trim().max(160).optional(),
    source: webhookSourceSchema.default("BROWSER_EXTENSION"),
  })
  .strict();

export const webhookListingSchema = createListingSchema
  .extend({
    idempotencyKey: z.string().trim().max(160).optional(),
    source: webhookSourceSchema.default("BROWSER_EXTENSION"),
  })
  .strict();

export const webhookInventorySchema = createInventorySchema
  .extend({
    idempotencyKey: z.string().trim().max(160).optional(),
    source: webhookSourceSchema.default("BROWSER_EXTENSION"),
  })
  .strict();
