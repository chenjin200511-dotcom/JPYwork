// Purpose: Translates stored enum values and shared workspace labels for UI display.
import type { Language } from "@/lib/i18n/dictionary";

export type LocalizedText = string | { en: string; zh: string };

export function uiText(language: Language, value: LocalizedText) {
  return typeof value === "string" ? value : value[language];
}

const zhEnumLabels: Record<string, string> = {
  AFTER_SALES: "售后中",
  AI: "AI",
  APPROVAL: "待负责人审批",
  APPROVED: "已通过",
  CANCELLED: "已取消",
  CONNECTED: "已连接",
  CONTENT: "内容准备中",
  CRITICAL: "严重风险",
  DELIVERED: "已签收",
  DOING: "处理中",
  DONE: "已完成",
  DRAFT: "草稿",
  ERROR: "异常",
  EXCHANGE_RATE: "汇率服务",
  HIGH: "高优先级",
  IDEA: "灵感 / 选品期",
  IN_PROGRESS: "处理中",
  IN_TRANSIT: "运输中",
  INTERNAL: "内部",
  INVENTORY_CHECK: "库存检查中",
  INVENTORY_PURCHASE: "库存采购",
  KEY_REQUIRED: "缺少密钥",
  LISTING_PUBLISH: "商品发布审批",
  LOGISTICS: "物流服务",
  LOW: "低优先级",
  LOW_STOCK: "低库存",
  MEDIUM: "中优先级",
  MESSAGE_ESCALATION: "客服升级",
  MIAOSHOU: "妙手 ERP",
  NEW: "新订单",
  NORMAL: "正常",
  NOT_CONNECTED: "未连接",
  OPEN: "待处理",
  OPERATOR: "运营",
  ORDER_RISK: "订单风险",
  OUT_OF_STOCK: "缺货",
  OWNER: "负责人",
  PAUSED_PROMOTION: "暂停推广",
  PAYMENT: "支付服务",
  PENDING: "待审批",
  PENDING_APPROVAL: "待审批",
  PENDING_SHIPMENT: "待发货",
  PLAN: "今日计划",
  PRICING: "待定价",
  PUBLISHED: "已发布",
  READY_TO_PUBLISH: "待发布",
  REFUND: "退款审批",
  REJECTED: "已驳回",
  RESERVED: "已预留",
  RESHIPMENT: "补发审批",
  RESTOCK_SUGGESTED: "建议补货",
  RESOLVED: "已解决",
  REVIEW: "待复核",
  RISK: "风险订单",
  SHIPPED: "已发货",
  SHOPEE: "Shopee",
  SUPPORT: "客服与发货",
  TAX: "财税服务",
  TIKTOK: "TikTok Shop",
  TODO: "待处理",
  URGENT: "紧急",
  WAITING_OWNER: "等待负责人",
};

const enEnumLabels: Record<string, string> = {
  AFTER_SALES: "After-sales",
  AI: "AI",
  APPROVAL: "Approval",
  APPROVED: "Approved",
  CANCELLED: "Cancelled",
  CONNECTED: "Connected",
  CONTENT: "Content",
  CRITICAL: "Critical",
  DELIVERED: "Delivered",
  DOING: "Doing",
  DONE: "Done",
  DRAFT: "Draft",
  ERROR: "Error",
  EXCHANGE_RATE: "Exchange rate",
  HIGH: "High",
  IDEA: "Idea",
  IN_PROGRESS: "In progress",
  IN_TRANSIT: "In transit",
  INTERNAL: "Internal",
  INVENTORY_CHECK: "Inventory check",
  INVENTORY_PURCHASE: "Inventory purchase",
  KEY_REQUIRED: "Key required",
  LISTING_PUBLISH: "Listing publish",
  LOGISTICS: "Logistics",
  LOW: "Low",
  LOW_STOCK: "Low stock",
  MEDIUM: "Medium",
  MESSAGE_ESCALATION: "Message escalation",
  MIAOSHOU: "Miaoshou ERP",
  NEW: "New",
  NORMAL: "Normal",
  NOT_CONNECTED: "Not connected",
  OPEN: "Open",
  OPERATOR: "Operator",
  ORDER_RISK: "Order risk",
  OUT_OF_STOCK: "Out of stock",
  OWNER: "Owner",
  PAUSED_PROMOTION: "Promotion paused",
  PAYMENT: "Payment",
  PENDING: "Pending",
  PENDING_APPROVAL: "Pending approval",
  PENDING_SHIPMENT: "Pending shipment",
  PLAN: "Plan",
  PRICING: "Pricing",
  PUBLISHED: "Published",
  READY_TO_PUBLISH: "Ready to publish",
  REFUND: "Refund",
  REJECTED: "Rejected",
  RESERVED: "Reserved",
  RESHIPMENT: "Reshipment",
  RESTOCK_SUGGESTED: "Restock suggested",
  RESOLVED: "Resolved",
  REVIEW: "Review",
  RISK: "Risk",
  SHIPPED: "Shipped",
  SHOPEE: "Shopee",
  SUPPORT: "Support & Fulfillment",
  TAX: "Tax",
  TIKTOK: "TikTok Shop",
  TODO: "To do",
  URGENT: "Urgent",
  WAITING_OWNER: "Waiting owner",
};

const zhActionLabels: Record<string, string> = {
  approve: "审批通过",
  "auth.login": "登录系统",
  "api_connection.create": "创建 API 连接",
  "api_connection.update": "更新 API 连接",
  create: "创建",
  "create-pricing": "创建定价申请",
  "create-task": "创建关联任务",
  delete: "删除",
  escalate: "升级给负责人",
  note: "添加内部备注",
  "pricing_rule.approve": "审批通过定价",
  "pricing_rule.create": "创建定价",
  "pricing_rule.reject": "驳回定价",
  reject: "驳回",
  resolve: "标记已解决",
  submit: "提交审批",
  "task.create": "创建任务",
  update: "更新",
};

const enActionLabels: Record<string, string> = {
  approve: "Approved",
  "auth.login": "Signed in",
  "api_connection.create": "Created API connection",
  "api_connection.update": "Updated API connection",
  create: "Created",
  "create-pricing": "Created pricing request",
  "create-task": "Created linked task",
  delete: "Deleted",
  escalate: "Escalated",
  note: "Added note",
  "pricing_rule.approve": "Approved pricing",
  "pricing_rule.create": "Created pricing",
  "pricing_rule.reject": "Rejected pricing",
  reject: "Rejected",
  resolve: "Resolved",
  submit: "Submitted",
  "task.create": "Created task",
  update: "Updated",
};

const zhEntityLabels: Record<string, string> = {
  Activity: "动态记录",
  ApiConnection: "API 连接",
  Approval: "审批",
  AuditLog: "审计日志",
  ContentVersion: "内容版本",
  CustomerMessage: "客服消息",
  DailyBriefing: "每日简报",
  InventoryItem: "库存项",
  Listing: "商品刊登",
  Order: "订单",
  PricingRule: "定价",
  Task: "任务",
  User: "用户",
};

const enEntityLabels: Record<string, string> = {
  Activity: "Activity",
  ApiConnection: "API connection",
  Approval: "Approval",
  AuditLog: "Audit log",
  ContentVersion: "Content version",
  CustomerMessage: "Message",
  DailyBriefing: "Briefing",
  InventoryItem: "Inventory item",
  Listing: "Listing",
  Order: "Order",
  PricingRule: "Pricing",
  Task: "Task",
  User: "User",
};

export function enumLabel(language: Language, value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const labels = language === "zh" ? zhEnumLabels : enEnumLabels;
  return labels[value] ?? value;
}

export function actionLabel(language: Language, value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const labels = language === "zh" ? zhActionLabels : enActionLabels;
  return labels[value] ?? value;
}

export function entityLabel(language: Language, value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const labels = language === "zh" ? zhEntityLabels : enEntityLabels;
  return labels[value] ?? value;
}

export function translateActivityContent(language: Language, value: string) {
  if (language !== "zh") {
    return value;
  }

  return value
    .replace(/^Pricing approval: /, "定价审批：")
    .replace(/^Review pricing for ([^.]+)\.$/, "复核 $1 的定价申请。")
    .replace(/^Created /, "创建了")
    .replace(/^Updated /, "更新了")
    .replace(/^Deleted /, "删除了")
    .replace(/^Submitted pricing approval: /, "提交了定价审批：")
    .replace(/^Approved pricing: /, "审批通过定价：")
    .replace(/^Rejected pricing: /, "驳回定价：")
    .replace(/^Review pricing for /, "复核定价：")
    .replace(/^Follow order /, "跟进订单 ")
    .replace(/^Prepare listing /, "准备刊登 ")
    .replace(/^Restock /, "补货 ")
    .replace(/^Manual note from browser smoke$/, "浏览器测试添加的内部备注");
}
