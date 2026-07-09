"use client";

// Purpose: Shows Owner-only runtime configuration, webhook logs, and notification health.
import { useMemo, useState } from "react";
import { apiRequest } from "@/lib/client/apiClient";
import { useApi } from "@/lib/client/useApi";
import { useWorkspace } from "./WorkspaceAppShell";
import { WorkspacePanel } from "./WorkspaceCrudPage";

type StatusKind = "bad" | "ok" | "warn";

type WebhookLog = {
  createdAt: string;
  externalId: string | null;
  id: string;
  message: string;
  reason: string;
  recordId: string | null;
  source: string | null;
  status: "FAILED" | "SUCCESS";
  target: "inventory" | "listings" | "orders";
};

type SystemConfigResponse = {
  ai: {
    dailyTokenLimit: number;
    enabled: boolean;
    fallbackMode: string;
    missingEnvKeys: string[];
    temperature: number;
  };
  integrations: Array<{
    configured: boolean;
    displayName: string;
    missingEnvKeys: string[];
    provider: string;
    status: string;
  }>;
  notification: {
    configured: boolean;
    editableInUi: boolean;
    missingEnvKeys: string[];
    source: string;
  };
  webhook: {
    authHeaders: string[];
    endpoints: Array<{
      label: string;
      method: string;
      path: string;
      target: string;
    }>;
    missingEnvKeys: string[];
    recentLogs: WebhookLog[];
    summary: {
      failureCount: number;
      lastFailureAt: string | null;
      lastSuccessAt: string | null;
      successCount: number;
    };
    tokenConfigured: boolean;
  };
};

type WebhookLogsResponse = {
  logs: WebhookLog[];
  page: number;
  pageSize: number;
  summary: SystemConfigResponse["webhook"]["summary"];
  total: number;
  totalPages: number;
};

const copy = {
  en: {
    ai: "AI Copilot",
    auth: "Auth",
    configured: "Configured",
    disabled: "Disabled",
    envOnly: "Configured by environment variable only.",
    failed: "Failed",
    failureReason: "Failure reason",
    lastFailure: "Last failure",
    lastSuccess: "Last success",
    missing: "Missing",
    noLogs: "No webhook logs yet.",
    notification: "Notification hook",
    pageSubtitle:
      "Check AI safety knobs, JSON webhook writes, notification readiness, and recent sync health.",
    pageTitle: "System configuration",
    recentSync: "Recent sync",
    ruleFallback: "Rule fallback",
    sendTest: "Send test",
    source: "Source",
    success: "Success",
    testSkipped: "Notification hook is not configured.",
    testSent: "Test notification sent.",
    token: "Webhook token",
    webhook: "Webhook API",
  },
  zh: {
    ai: "AI 辅助",
    auth: "鉴权方式",
    configured: "已配置",
    disabled: "未启用",
    envOnly: "仅通过环境变量配置，页面不保存通知地址。",
    failed: "失败",
    failureReason: "失败原因",
    lastFailure: "最近失败",
    lastSuccess: "最近成功",
    missing: "缺少配置",
    noLogs: "暂无 Webhook 接收日志。",
    notification: "外部通知",
    pageSubtitle: "查看 AI 安全参数、JSON Webhook 写入、通知可用性和最近同步健康状态。",
    pageTitle: "系统配置",
    recentSync: "最近同步",
    ruleFallback: "规则兜底",
    sendTest: "发送测试",
    source: "来源",
    success: "成功",
    testSkipped: "通知 Hook 尚未配置。",
    testSent: "测试通知已发送。",
    token: "Webhook Token",
    webhook: "Webhook API",
  },
} as const;

function formatDate(value: string | null, language: "en" | "zh") {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function StatusBadge({
  kind,
  label,
}: {
  kind: StatusKind;
  label: string;
}) {
  return <span className={`workspace-config-status is-${kind}`}>{label}</span>;
}

function configState(configured: boolean): StatusKind {
  return configured ? "ok" : "warn";
}

export function WorkspaceSystemSettingsPage() {
  const { copy: workspaceCopy, language, user } = useWorkspace();
  const text = copy[language];
  const [notice, setNotice] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const config = useApi<SystemConfigResponse>(
    user.role === "OWNER" ? "/api/system/config" : null,
  );
  const logsUrl = useMemo(() => {
    const params = new URLSearchParams({ pageSize: "20" });

    if (statusFilter) {
      params.set("status", statusFilter);
    }

    return user.role === "OWNER" ? `/api/webhooks/logs?${params.toString()}` : null;
  }, [statusFilter, user.role]);
  const logs = useApi<WebhookLogsResponse>(logsUrl);

  async function testNotification() {
    const result = await apiRequest<{ sent: boolean; skipped: boolean }>(
      "/api/system/notifications/test",
      { method: "POST" },
    );
    setNotice(result.sent ? text.testSent : text.testSkipped);
    config.reload();
  }

  if (user.role !== "OWNER") {
    return (
      <WorkspacePanel
        subtitle={workspaceCopy.common.ownerOnly}
        title={workspaceCopy.common.ownerOnly}
      >
        <p className="workspace-error">{workspaceCopy.common.ownerOnly}</p>
      </WorkspacePanel>
    );
  }

  const data = config.data;
  const webhookLogs = logs.data?.logs ?? data?.webhook.recentLogs ?? [];
  const webhookSummary = logs.data?.summary ?? data?.webhook.summary;

  return (
    <WorkspacePanel subtitle={text.pageSubtitle} title={text.pageTitle}>
      {notice ? <p className="workspace-notice">{notice}</p> : null}
      {config.error ? <p className="workspace-error">{config.error}</p> : null}
      {logs.error ? <p className="workspace-error">{logs.error}</p> : null}

      <section className="workspace-system-grid">
        <article className="workspace-card workspace-config-card">
          <div className="workspace-config-card__head">
            <span>{text.ai}</span>
            <StatusBadge
              kind={configState(Boolean(data?.ai.enabled))}
              label={data?.ai.enabled ? text.configured : text.ruleFallback}
            />
          </div>
          <dl className="workspace-config-dl">
            <div>
              <dt>AI_TOTAL_TOKEN_LIMIT</dt>
              <dd>{data?.ai.dailyTokenLimit ?? "—"}</dd>
            </div>
            <div>
              <dt>AI_TEMPERATURE</dt>
              <dd>{data?.ai.temperature ?? "—"}</dd>
            </div>
            <div>
              <dt>{text.missing}</dt>
              <dd>{data?.ai.missingEnvKeys.join(", ") || "—"}</dd>
            </div>
          </dl>
        </article>

        <article className="workspace-card workspace-config-card">
          <div className="workspace-config-card__head">
            <span>{text.webhook}</span>
            <StatusBadge
              kind={configState(Boolean(data?.webhook.tokenConfigured))}
              label={data?.webhook.tokenConfigured ? text.configured : text.missing}
            />
          </div>
          <dl className="workspace-config-dl">
            <div>
              <dt>{text.token}</dt>
              <dd>{data?.webhook.tokenConfigured ? text.configured : "INTEGRATION_WEBHOOK_TOKEN"}</dd>
            </div>
            <div>
              <dt>{text.success}</dt>
              <dd>{webhookSummary?.successCount ?? 0}</dd>
            </div>
            <div>
              <dt>{text.failed}</dt>
              <dd>{webhookSummary?.failureCount ?? 0}</dd>
            </div>
          </dl>
        </article>

        <article className="workspace-card workspace-config-card">
          <div className="workspace-config-card__head">
            <span>{text.notification}</span>
            <StatusBadge
              kind={configState(Boolean(data?.notification.configured))}
              label={data?.notification.configured ? text.configured : text.missing}
            />
          </div>
          <p className="workspace-config-note">{text.envOnly}</p>
          <div className="workspace-config-actions">
            <button
              className="workspace-mini-button"
              disabled={!data?.notification.configured}
              onClick={() => void testNotification()}
              type="button"
            >
              {text.sendTest}
            </button>
          </div>
        </article>

        <article className="workspace-card workspace-config-card">
          <div className="workspace-config-card__head">
            <span>{text.recentSync}</span>
            <StatusBadge
              kind={webhookSummary?.lastFailureAt ? "warn" : "ok"}
              label={webhookSummary?.lastFailureAt ? text.failed : text.success}
            />
          </div>
          <dl className="workspace-config-dl">
            <div>
              <dt>{text.lastSuccess}</dt>
              <dd>{formatDate(webhookSummary?.lastSuccessAt ?? null, language)}</dd>
            </div>
            <div>
              <dt>{text.lastFailure}</dt>
              <dd>{formatDate(webhookSummary?.lastFailureAt ?? null, language)}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="workspace-card workspace-config-card workspace-config-card--wide">
        <div className="workspace-section-head">
          <h2>{text.webhook}</h2>
          <button className="workspace-mini-button" onClick={config.reload} type="button">
            {workspaceCopy.actions.refresh}
          </button>
        </div>
        <div className="workspace-endpoint-grid">
          {(data?.webhook.endpoints ?? []).map((endpoint) => (
            <div className="workspace-endpoint" key={endpoint.path}>
              <span>{endpoint.label}</span>
              <strong>{endpoint.method}</strong>
              <code>{endpoint.path}</code>
            </div>
          ))}
        </div>
        <p className="workspace-config-note">
          {text.auth}: {(data?.webhook.authHeaders ?? []).join(" / ")}
        </p>
      </section>

      <section className="workspace-card workspace-config-card workspace-config-card--wide">
        <div className="workspace-section-head">
          <h2>{text.recentSync}</h2>
          <select
            className="workspace-compact-select"
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
          >
            <option value="">{workspaceCopy.common.all}</option>
            <option value="SUCCESS">{text.success}</option>
            <option value="FAILED">{text.failed}</option>
          </select>
        </div>
        <div className="workspace-webhook-log-list">
          {logs.isLoading || config.isLoading ? (
            <p className="workspace-muted">{workspaceCopy.common.loading}</p>
          ) : null}
          {!webhookLogs.length && !logs.isLoading && !config.isLoading ? (
            <p className="workspace-muted">{text.noLogs}</p>
          ) : null}
          {webhookLogs.map((log) => (
            <article className="workspace-webhook-log" key={log.id}>
              <StatusBadge
                kind={log.status === "SUCCESS" ? "ok" : "bad"}
                label={log.status === "SUCCESS" ? text.success : text.failed}
              />
              <span>{formatDate(log.createdAt, language)}</span>
              <strong>{log.target}</strong>
              <p>{log.externalId || log.recordId || "—"}</p>
              <em>{log.reason || log.message || "—"}</em>
            </article>
          ))}
        </div>
      </section>
    </WorkspacePanel>
  );
}
