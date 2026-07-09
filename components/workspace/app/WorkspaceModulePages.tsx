"use client";

// Purpose: Defines concrete JPY workspace module pages and localized UI labels.
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/client/apiClient";
import { useApi } from "@/lib/client/useApi";
import { useWorkspace } from "./WorkspaceAppShell";
import { PricingWorkbench } from "./PricingWorkbench";
import {
  WorkspaceCrudPage,
  WorkspacePanel,
  type CrudPageConfig,
  type WorkspaceRecord,
} from "./WorkspaceCrudPage";
import { enumLabel } from "./workspaceLabels";

const platformOptions = ["SHOPEE", "TIKTOK", "MIAOSHOU", "INTERNAL"];
const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const taskStatusOptions = ["TODO", "DOING", "REVIEW", "DONE"];
const messageStatusOptions = ["OPEN", "IN_PROGRESS", "WAITING_OWNER", "RESOLVED"];
const orderStatusOptions = [
  "NEW",
  "PENDING_SHIPMENT",
  "SHIPPED",
  "IN_TRANSIT",
  "DELIVERED",
  "AFTER_SALES",
  "CANCELLED",
  "RISK",
];
const riskOptions = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const listingStatusOptions = [
  "IDEA",
  "PRICING",
  "CONTENT",
  "INVENTORY_CHECK",
  "APPROVAL",
  "READY_TO_PUBLISH",
  "PUBLISHED",
  "ERROR",
];
const approvalTypeOptions = [
  "PRICING",
  "REFUND",
  "RESHIPMENT",
  "LISTING_PUBLISH",
  "ORDER_RISK",
  "MESSAGE_ESCALATION",
  "INVENTORY_PURCHASE",
];
const inventoryStatusOptions = [
  "NORMAL",
  "LOW_STOCK",
  "OUT_OF_STOCK",
  "RESTOCK_SUGGESTED",
  "PAUSED_PROMOTION",
];
const connectionProviderOptions = [
  "SHOPEE",
  "TIKTOK",
  "MIAOSHOU",
  "AI",
  "EXCHANGE_RATE",
  "PAYMENT",
  "LOGISTICS",
  "TAX",
];
const connectionStatusOptions = [
  "NOT_CONNECTED",
  "RESERVED",
  "KEY_REQUIRED",
  "CONNECTED",
  "ERROR",
];

function l(zh: string, en: string) {
  return { en, zh };
}

function recordText(record: WorkspaceRecord, key: string) {
  const value = record[key];

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "";
}

const briefingKeyLabels: Record<string, string> = {
  completedTasks: "已完成任务数",
  date: "日期",
  focus: "今日重点",
  inventoryAlerts: "库存预警",
  openMessages: "待处理客服消息",
  openTasks: "未完成任务",
  orderRisks: "订单风险",
  pending: "待处理事项",
  pendingApprovals: "待审批事项",
  summary: "简报摘要",
  tomorrowSuggestion: "明日建议",
  type: "简报类型",
};

function localizeBriefingString(language: "en" | "zh", value: string) {
  if (language !== "zh") {
    return value;
  }

  return value.replace(/\b[A-Z][A-Z_]+\b/g, (token) => enumLabel(language, token));
}

function localizeBriefingContent(language: "en" | "zh", value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => localizeBriefingContent(language, item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        language === "zh" ? (briefingKeyLabels[key] ?? key) : key,
        localizeBriefingContent(language, item),
      ]),
    );
  }

  if (typeof value === "string") {
    return localizeBriefingString(language, value);
  }

  return value;
}

function briefingDisplayText(language: "en" | "zh", content: unknown) {
  return JSON.stringify(localizeBriefingContent(language, content), null, 2);
}

function taskActionBody(title: string) {
  return {
    platform: "INTERNAL",
    priority: "MEDIUM",
    status: "TODO",
    title,
  };
}

export function WorkspaceTasksPage() {
  const config: CrudPageConfig = {
    activityEntityType: "Task",
    createFields: [
      { label: l("任务标题", "Title"), name: "title", required: true, type: "text" },
      { label: l("任务说明", "Description"), name: "description", type: "textarea" },
      { label: l("负责人", "Assignee"), name: "assigneeId", relation: "users", type: "select" },
      { label: l("截止时间", "Due at"), name: "dueAt", type: "datetime-local" },
      { label: l("业务平台", "Platform"), name: "platform", options: platformOptions, type: "select" },
      { label: l("优先级", "Priority"), name: "priority", options: priorityOptions, type: "select" },
      { label: l("处理状态", "Status"), name: "status", options: taskStatusOptions, type: "select" },
    ],
    displayFields: [
      { key: "platform", label: l("业务平台", "Platform"), tone: "mono" },
      { key: "priority", label: l("优先级", "Priority") },
      { key: "description", label: l("任务说明", "Description") },
      { key: "updatedAt", label: l("更新时间", "Updated"), tone: "muted" },
    ],
    endpoint: "/api/tasks",
    listKey: "tasks",
    moduleKey: "tasks",
    patchMode: "root",
    recordTitle: (record) => recordText(record, "title"),
    statusField: "status",
    statusOptions: taskStatusOptions,
  };

  return <WorkspaceCrudPage config={config} />;
}

export function WorkspaceMessagesPage() {
  const { copy, language } = useWorkspace();
  const templates = useApi<{ templates: WorkspaceRecord[] }>("/api/message-templates?pageSize=20");
  const config: CrudPageConfig = {
    activityEntityType: "CustomerMessage",
    createFields: [
      { label: l("消息主题", "Subject"), name: "subject", required: true, type: "text" },
      { label: l("客户名称", "Customer"), name: "customerName", required: true, type: "text" },
      { label: l("客户问题", "Message"), name: "message", required: true, type: "textarea" },
      { label: l("负责人", "Assignee"), name: "assigneeId", relation: "users", type: "select" },
      { label: l("履约时效 / 截止时间", "SLA / Deadline"), name: "dueAt", type: "datetime-local" },
      { label: l("业务平台", "Platform"), name: "platform", options: platformOptions, type: "select" },
      { label: l("优先级", "Priority"), name: "priority", options: priorityOptions, type: "select" },
      { label: l("处理状态", "Status"), name: "status", options: messageStatusOptions, type: "select" },
    ],
    displayFields: [
      { key: "customerName", label: l("客户名称", "Customer") },
      { key: "priority", label: l("优先级", "Priority") },
      { key: "message", label: l("客户问题", "Message") },
      { key: "aiDraft", label: l("AI 草稿", "AI draft") },
    ],
    endpoint: "/api/messages",
    listKey: "messages",
    moduleKey: "messages",
    patchMode: "id",
    recordTitle: (record) => recordText(record, "subject"),
    rowActions: ({ reload, setNotice }) => [
      {
        label: l("标记已解决", "Resolve"),
        onRun: async (record) => {
          await apiRequest(`/api/messages/${record.id}/resolve`, { method: "POST" });
          setNotice(language === "zh" ? "客服消息已标记为已解决" : "Message resolved");
          reload();
        },
        show: (record) => record.status !== "RESOLVED",
      },
      {
        label: l("升级给负责人", "Escalate"),
        onRun: async (record) => {
          const note =
            window.prompt(language === "zh" ? "请输入升级说明" : "Escalation note") ??
            "";
          await apiRequest(`/api/messages/${record.id}/escalate`, {
            body: { note },
            method: "POST",
          });
          setNotice(language === "zh" ? "已升级给负责人" : "Escalated");
          reload();
        },
        show: (record) => record.status !== "WAITING_OWNER",
      },
    ],
    statusField: "status",
    statusOptions: messageStatusOptions,
  };

  return (
    <>
      <WorkspaceCrudPage config={config} />
      <section className="workspace-page workspace-page--below">
        <article className="workspace-card">
          <div className="workspace-section-head">
            <h2>{language === "zh" ? "客服回复模板" : "Message templates"}</h2>
            <button className="workspace-mini-button" onClick={templates.reload} type="button">
              {copy.actions.refresh}
            </button>
          </div>
          <div className="workspace-template-grid">
            {(templates.data?.templates ?? []).map((template) => (
              <button
                className="workspace-template"
                key={template.id}
                onClick={() =>
                  void navigator.clipboard.writeText(
                    recordText(template, language === "zh" ? "contentZh" : "contentEn"),
                  )
                }
                type="button"
              >
                <strong>{recordText(template, "title")}</strong>
                <span>{recordText(template, "category")}</span>
              </button>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

export function WorkspaceOrdersPage() {
  const { copy, language } = useWorkspace();
  const config: CrudPageConfig = {
    activityEntityType: "Order",
    createFields: [
      { label: l("订单号", "Order ID"), name: "externalOrderId", required: true, type: "text" },
      { label: l("客户名称", "Customer"), name: "customerName", required: true, type: "text" },
      { label: l("负责人", "Assignee"), name: "assigneeId", relation: "users", type: "select" },
      { label: l("订单金额", "Total amount"), name: "totalAmount", type: "number" },
      { label: l("预估利润", "Estimated profit"), name: "estimatedProfit", type: "number" },
      { label: l("SKU 数量", "SKU count"), name: "skuCount", type: "number" },
      { label: l("业务平台", "Platform"), name: "platform", options: platformOptions, type: "select" },
      { label: l("订单状态", "Order status"), name: "status", options: orderStatusOptions, type: "select" },
      { label: l("风险等级", "Risk level"), name: "riskLevel", options: riskOptions, type: "select" },
    ],
    displayFields: [
      { key: "customerName", label: l("客户名称", "Customer") },
      { key: "totalAmount", label: l("订单金额", "Total amount"), tone: "mono" },
      { key: "estimatedProfit", label: l("预估利润", "Estimated profit"), tone: "strong" },
      { key: "riskLevel", label: l("风险等级", "Risk level") },
    ],
    endpoint: "/api/orders",
    exportEndpoint: "/api/orders/export",
    importEndpoint: "/api/orders/import",
    listKey: "orders",
    moduleKey: "orders",
    patchMode: "root",
    recordTitle: (record) => recordText(record, "externalOrderId"),
    rowActions: ({ reload, setNotice }) => [
      {
        label: l("创建关联任务", "Create task"),
        onRun: async (record) => {
          await apiRequest(`/api/orders/${record.id}/create-task`, {
            body: taskActionBody(
              language === "zh"
                ? `跟进订单 ${recordText(record, "externalOrderId")}`
                : `Follow order ${recordText(record, "externalOrderId")}`,
            ),
            method: "POST",
          });
          setNotice(copy.nav.tasks);
          reload();
        },
      },
    ],
    statusField: "status",
    statusOptions: orderStatusOptions,
  };

  return <WorkspaceCrudPage config={config} />;
}

export function WorkspaceListingsPage() {
  const { copy, language } = useWorkspace();
  const config: CrudPageConfig = {
    activityEntityType: "Listing",
    createFields: [
      { label: l("SKU", "SKU"), name: "sku", required: true, type: "text" },
      { label: l("商品标题", "Product title"), name: "title", required: true, type: "text" },
      { label: l("负责人", "Owner"), name: "ownerId", relation: "users", type: "select" },
      { label: l("商品成本", "Cost"), name: "cost", type: "number" },
      { label: l("目标售价", "Target price"), name: "targetPrice", type: "number" },
      { label: l("业务平台", "Platform"), name: "platform", options: platformOptions, type: "select" },
      { label: l("刊登状态", "Listing status"), name: "status", options: listingStatusOptions, type: "select" },
    ],
    displayFields: [
      { key: "sku", label: l("SKU", "SKU"), tone: "mono" },
      { key: "cost", label: l("商品成本", "Cost") },
      { key: "targetPrice", label: l("目标售价", "Target price"), tone: "strong" },
      { key: "currentStep", label: l("当前步骤", "Current step") },
    ],
    endpoint: "/api/listings",
    exportEndpoint: "/api/listings/export",
    importEndpoint: "/api/listings/import",
    listKey: "listings",
    moduleKey: "listings",
    patchMode: "id",
    recordTitle: (record) => recordText(record, "title"),
    rowActions: ({ reload, setNotice }) => [
      {
        label: l("创建关联任务", "Create task"),
        onRun: async (record) => {
          await apiRequest(`/api/listings/${record.id}/create-task`, {
            body: taskActionBody(
              language === "zh"
                ? `准备刊登 ${recordText(record, "sku")}`
                : `Prepare listing ${recordText(record, "sku")}`,
            ),
            method: "POST",
          });
          setNotice(copy.nav.tasks);
          reload();
        },
      },
    ],
    statusField: "status",
    statusOptions: listingStatusOptions,
  };

  return <WorkspaceCrudPage config={config} />;
}

export function WorkspaceInventoryPage() {
  const { copy, language } = useWorkspace();
  const config: CrudPageConfig = {
    activityEntityType: "InventoryItem",
    createFields: [
      { label: l("SKU", "SKU"), name: "sku", required: true, type: "text" },
      { label: l("商品名称", "Product name"), name: "productName", required: true, type: "text" },
      { label: l("可用库存", "Available"), name: "available", type: "number" },
      { label: l("在途库存", "Incoming"), name: "incoming", type: "number" },
      { label: l("安全库存", "Safety stock"), name: "safetyStock", type: "number" },
      { label: l("库存备注", "Note"), name: "note", type: "textarea" },
    ],
    displayFields: [
      { key: "sku", label: l("SKU", "SKU"), tone: "mono" },
      { key: "available", label: l("可用库存", "Available"), tone: "strong" },
      { key: "incoming", label: l("在途库存", "Incoming") },
      { key: "safetyStock", label: l("安全库存", "Safety stock") },
    ],
    endpoint: "/api/inventory",
    exportEndpoint: "/api/inventory/export",
    importEndpoint: "/api/inventory/import",
    listKey: "items",
    moduleKey: "inventory",
    patchMode: "id",
    recordTitle: (record) => recordText(record, "productName"),
    rowActions: ({ reload, setNotice }) => [
      {
        label: l("创建补货任务", "Create restock task"),
        onRun: async (record) => {
          await apiRequest(`/api/inventory/${record.id}/create-task`, {
            body: taskActionBody(
              language === "zh"
                ? `补货 ${recordText(record, "sku")}`
                : `Restock ${recordText(record, "sku")}`,
            ),
            method: "POST",
          });
          setNotice(copy.nav.tasks);
          reload();
        },
      },
    ],
    statusField: "status",
    statusOptions: inventoryStatusOptions,
  };

  return <WorkspaceCrudPage config={config} />;
}

export function WorkspacePricingPage() {
  return <PricingWorkbench />;
}

export function WorkspaceApprovalsPage() {
  const { copy, user } = useWorkspace();
  const config: CrudPageConfig = {
    activityEntityType: "Approval",
    createFields: [
      { label: l("审批标题", "Title"), name: "title", required: true, type: "text" },
      { label: l("审批说明", "Description"), name: "description", type: "textarea" },
      { label: l("审批人", "Approver"), name: "approverId", relation: "users", type: "select" },
      { label: l("审批类型", "Type"), name: "type", options: approvalTypeOptions, required: true, type: "select" },
    ],
    displayFields: [
      { key: "type", label: l("审批类型", "Type") },
      { key: "description", label: l("审批说明", "Description") },
      { key: "decisionNote", label: l("审批备注", "Decision note") },
      { key: "updatedAt", label: l("更新时间", "Updated"), tone: "muted" },
    ],
    endpoint: "/api/approvals",
    listKey: "approvals",
    moduleKey: "approvals",
    recordTitle: (record) => recordText(record, "title"),
    rowActions: ({ reload, setNotice }) => [
      {
        label: l("审批通过", "Approve"),
        onRun: async (record) => {
          await apiRequest(`/api/approvals/${record.id}/approve`, { method: "POST" });
          setNotice(copy.actions.approve);
          reload();
        },
        show: (record) => user.role === "OWNER" && record.status === "PENDING",
      },
      {
        label: l("驳回审批", "Reject"),
        onRun: async (record) => {
          await apiRequest(`/api/approvals/${record.id}/reject`, { method: "POST" });
          setNotice(copy.actions.reject);
          reload();
        },
        show: (record) => user.role === "OWNER" && record.status === "PENDING",
        tone: "danger",
      },
    ],
    statusField: "status",
    statusOptions: ["PENDING", "APPROVED", "REJECTED"],
  };

  return <WorkspaceCrudPage config={config} />;
}

type BriefingRecord = WorkspaceRecord & {
  contentJson?: unknown;
  type?: string;
};

export function WorkspaceBriefingPage() {
  const { copy, language } = useWorkspace();
  const [type, setType] = useState("PLAN");
  const [notice, setNotice] = useState("");
  const { data, error, isLoading, reload } = useApi<{ briefings: BriefingRecord[] }>(
    "/api/briefings?pageSize=10",
  );

  async function generateBriefing() {
    await apiRequest("/api/briefings/generate", {
      body: { type },
      method: "POST",
    });
    setNotice(copy.actions.generate);
    reload();
  }

  return (
    <WorkspacePanel
      subtitle={copy.modules.briefing.subtitle}
      title={copy.modules.briefing.title}
    >
      <section className="workspace-card workspace-briefing-builder">
        <select onChange={(event) => setType(event.target.value)} value={type}>
          <option value="PLAN">{enumLabel(language, "PLAN")}</option>
          <option value="REVIEW">{enumLabel(language, "REVIEW")}</option>
        </select>
        <button className="workspace-button" onClick={generateBriefing} type="button">
          {copy.actions.generate}
        </button>
      </section>
      {notice ? <p className="workspace-notice">{notice}</p> : null}
      {error ? <p className="workspace-error">{error}</p> : null}
      {isLoading ? <p className="workspace-notice">{copy.common.loading}</p> : null}
      <section className="workspace-record-grid">
        {(data?.briefings ?? []).map((briefing) => {
          const displayText = briefingDisplayText(language, briefing.contentJson);

          return (
            <article
              className="workspace-record-card workspace-record-card--briefing"
              key={briefing.id}
            >
              <div className="workspace-record-card__head">
                <h2>{enumLabel(language, briefing.type)}</h2>
                <button
                  className="workspace-mini-button"
                  onClick={() => void navigator.clipboard.writeText(displayText)}
                  type="button"
                >
                  {copy.actions.copy}
                </button>
              </div>
              <pre>{displayText}</pre>
            </article>
          );
        })}
      </section>
    </WorkspacePanel>
  );
}

type ConnectionRecord = WorkspaceRecord & {
  displayName?: string;
  provider?: string;
  status?: string;
};

export function WorkspaceIntegrationsPage() {
  const { copy, language, user } = useWorkspace();
  const { data, error, isLoading, reload } =
    useApi<{ connections: ConnectionRecord[] }>("/api/connections?pageSize=20");
  const [notice, setNotice] = useState("");

  async function updateConnection(provider: string, status: string) {
    await apiRequest("/api/connections", {
      body: { provider, status },
      method: "PATCH",
    });
    setNotice(`${enumLabel(language, provider)}：${enumLabel(language, status)}`);
    reload();
  }

  async function testConnection(provider: string) {
    const result = await apiRequest<{
      configured: boolean;
      missingEnvKeys: string[];
      status: string;
    }>(`/api/integrations/${provider.toLowerCase()}/test`, {
      method: "POST",
    });
    setNotice(
      result.configured
        ? `${enumLabel(language, provider)}：${enumLabel(language, result.status)}`
        : language === "zh"
          ? `${enumLabel(language, provider)}：缺少配置 ${result.missingEnvKeys.join(", ") || "环境变量"}`
          : `${enumLabel(language, provider)}: missing ${result.missingEnvKeys.join(", ") || "keys"}`,
    );
  }

  return (
    <WorkspacePanel
      subtitle={copy.modules.integrations.subtitle}
      title={copy.modules.integrations.title}
    >
      {notice ? <p className="workspace-notice">{notice}</p> : null}
      {error ? <p className="workspace-error">{error}</p> : null}
      {isLoading ? <p className="workspace-notice">{copy.common.loading}</p> : null}
      <section className="workspace-record-grid">
        {(data?.connections ?? []).map((connection) => (
          <article className="workspace-record-card" key={connection.id}>
            <div className="workspace-record-card__head">
              <h2>{enumLabel(language, connection.provider)}</h2>
              <span className="workspace-status-pill">
                {enumLabel(language, connection.status)}
              </span>
            </div>
            <dl>
              <div>
                <dt>{language === "zh" ? "连接服务" : "Provider"}</dt>
                <dd>{enumLabel(language, connection.provider)}</dd>
              </div>
              <div>
                <dt>{language === "zh" ? "连接状态" : "Status"}</dt>
                <dd>{enumLabel(language, connection.status)}</dd>
              </div>
            </dl>
            {user.role === "OWNER" ? (
              <div className="workspace-record-card__actions">
                <select
                  onChange={(event) =>
                    void updateConnection(recordText(connection, "provider"), event.target.value)
                  }
                  value={recordText(connection, "status")}
                >
                  {connectionStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {enumLabel(language, status)}
                    </option>
                  ))}
                </select>
                <button
                  className="workspace-mini-button"
                  onClick={() => void testConnection(recordText(connection, "provider"))}
                  type="button"
                >
                  {copy.actions.test}
                </button>
              </div>
            ) : null}
          </article>
        ))}
        {!data?.connections?.length && !isLoading ? (
          <article className="workspace-record-card">
            <h2>
              {connectionProviderOptions
                .map((provider) => enumLabel(language, provider))
                .join(" / ")}
            </h2>
            <p>{copy.common.empty}</p>
          </article>
        ) : null}
      </section>
    </WorkspacePanel>
  );
}

type ContentResponse = {
  content: Record<string, unknown>;
  key: string;
  language: string;
  source: string;
  version: number;
};

export function WorkspaceContentSettingsPage() {
  const { copy, language, user } = useWorkspace();
  const [contentKey, setContentKey] = useState<"site" | "theme" | "workspace">("site");
  const endpoint =
    contentKey === "theme"
      ? "/api/content/theme?lang=neutral"
      : `/api/content/${contentKey}?lang=${language}`;
  const { data, error, isLoading, reload } = useApi<ContentResponse>(endpoint);
  const [jsonText, setJsonText] = useState("{}");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (data?.content) {
      const timer = window.setTimeout(() => {
        setJsonText(JSON.stringify(data.content, null, 2));
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [data?.content]);

  async function saveContent() {
    const contentJson = JSON.parse(jsonText) as Record<string, unknown>;
    await apiRequest(endpoint, {
      body: { contentJson },
      method: "PUT",
    });
    setNotice(copy.actions.save);
    reload();
  }

  return (
    <WorkspacePanel subtitle={copy.modules.content.subtitle} title={copy.modules.content.title}>
      <section className="workspace-card workspace-content-editor">
        <div className="workspace-tools">
          <label className="workspace-field">
            <span>{language === "zh" ? "配置类型" : "Content key"}</span>
            <select
              onChange={(event) =>
                setContentKey(event.target.value as "site" | "theme" | "workspace")
              }
              value={contentKey}
            >
              <option value="site">{language === "zh" ? "公开首页内容" : "Site content"}</option>
              <option value="workspace">{language === "zh" ? "工作区内容" : "Workspace content"}</option>
              <option value="theme">{language === "zh" ? "主题配置" : "Theme"}</option>
            </select>
          </label>
          <p>{copy.modules.content.helper}</p>
        </div>
        {notice ? <p className="workspace-notice">{notice}</p> : null}
        {error ? <p className="workspace-error">{error}</p> : null}
        {isLoading ? <p className="workspace-notice">{copy.common.loading}</p> : null}
        <textarea
          className="workspace-json-editor"
          onChange={(event) => setJsonText(event.target.value)}
          value={jsonText}
        />
        <button
          className="workspace-button"
          disabled={user.role !== "OWNER"}
          onClick={() => void saveContent()}
          type="button"
        >
          {copy.actions.save}
        </button>
      </section>
    </WorkspacePanel>
  );
}

export function WorkspaceAuditPage() {
  const config: CrudPageConfig = {
    displayFields: [
      { key: "action", label: l("操作动作", "Action") },
      { key: "entityType", label: l("对象类型", "Entity") },
      { key: "entityId", label: l("对象 ID", "Entity ID"), tone: "mono" },
      { key: "createdAt", label: l("创建时间", "Created"), tone: "muted" },
    ],
    endpoint: "/api/audit",
    listKey: "logs",
    moduleKey: "audit",
    recordTitle: (record) => recordText(record, "action"),
  };

  return <WorkspaceCrudPage config={config} />;
}
