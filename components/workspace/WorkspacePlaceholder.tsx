"use client";

// Purpose: Shows the localized workspace placeholder behind secure mock team auth.
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Language } from "@/lib/i18n/dictionary";
import { useLanguage } from "@/lib/i18n/useLanguage";

const metricValues = ["00", "00", "00", "00", "--", "00"];

type WorkspacePlaceholderProps = {
  initialLanguage: Language;
};

type WorkspaceUser = {
  email: string;
  id: string;
  name: string;
  role: "OWNER" | "OPERATOR" | "SUPPORT";
};

type DashboardSummary = {
  connectionCount: number;
  inventoryAlerts: number;
  messagesWaiting: number;
  ordersToday: number;
  pendingPricing: number;
  pendingShipment: number;
  profitToday: number | string;
  riskTasks: number;
};

type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

const roleLabels: Record<WorkspaceUser["role"], Record<Language, string>> = {
  OPERATOR: {
    en: "Operator",
    zh: "运营",
  },
  OWNER: {
    en: "Owner",
    zh: "负责人",
  },
  SUPPORT: {
    en: "Support & Fulfillment",
    zh: "客服与发货",
  },
};

function formatMetricValue(value: number | string) {
  return typeof value === "number" ? String(value).padStart(2, "0") : value;
}

export function WorkspacePlaceholder({ initialLanguage }: WorkspacePlaceholderProps) {
  const { copy, language, toggleLanguage } = useLanguage(initialLanguage);
  const [user, setUser] = useState<WorkspaceUser | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryError, setSummaryError] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      const result = (await response.json()) as ApiResponse<{
        user: WorkspaceUser | null;
      }>;

      if (!response.ok || !result.success || !result.data.user) {
        setUser(null);
        setSummary(null);
        setSummaryError("");
        return;
      }

      setUser(result.data.user);

      const summaryResponse = await fetch("/api/dashboard/summary", {
        credentials: "include",
      });
      const summaryResult =
        (await summaryResponse.json()) as ApiResponse<DashboardSummary>;

      if (summaryResponse.ok && summaryResult.success) {
        setSummary(summaryResult.data);
        setSummaryError("");
      } else {
        setSummaryError(copy.workspace.dashboardError);
      }
    } catch {
      setUser(null);
      setSummary(null);
      setSummaryError(copy.workspace.dashboardError);
    } finally {
      setIsCheckingSession(false);
    }
  }, [copy.workspace.dashboardError]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSession();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSession]);

  async function handleSignOut() {
    await fetch("/api/auth/logout", {
      credentials: "include",
      method: "POST",
    });
    setUser(null);
    setSummary(null);
    setSummaryError("");
  }

  if (!user) {
    return (
      <main className="workspace-placeholder workspace-placeholder--locked">
        <section className="workspace-placeholder__locked-card interactive-card">
          <p className="workspace-placeholder__eyebrow">
            {copy.workspace.consoleEyebrow}
          </p>
          <h1>
            {isCheckingSession
              ? copy.workspace.workspaceTitle
              : copy.workspace.authRequiredTitle}
          </h1>
          <p className="workspace-placeholder__subtitle">
            {isCheckingSession
              ? copy.workspace.workspaceSubtitle
              : copy.workspace.authRequiredSubtitle}
          </p>
          <Link href="/" className="workspace-placeholder__link primary-action">
            {copy.workspace.homeLink}
          </Link>
        </section>
      </main>
    );
  }

  const languageLabel =
    language === "zh" ? copy.workspace.languageZh : copy.workspace.languageEn;
  const orderTitle = `${copy.workspace.sidebarModules[1]} ${copy.workspace.orders}`;
  const messageTitle = `${copy.workspace.sidebarModules[1]} ${copy.workspace.messages}`;
  const displayedMetricValues = summary
    ? [
        formatMetricValue(summary.ordersToday),
        formatMetricValue(summary.pendingShipment),
        formatMetricValue(summary.messagesWaiting),
        formatMetricValue(summary.inventoryAlerts),
        summary.profitToday,
        formatMetricValue(summary.riskTasks),
      ]
    : metricValues;
  const overviewRows = [
    copy.workspace.tasks,
    copy.workspace.messages,
    copy.workspace.pricing,
  ];
  const previewModules = [
    copy.workspace.tasks,
    copy.workspace.messages,
    copy.workspace.orders,
    copy.workspace.inventory,
    copy.workspace.pricing,
    copy.workspace.financeTax,
  ];

  return (
    <main className="workspace-placeholder">
      <header className="workspace-placeholder__toolbar">
        <Link href="/" className="workspace-placeholder__toolbar-brand">
          {copy.common.teamShortName}
        </Link>
        <div className="workspace-placeholder__toolbar-meta" aria-label={copy.workspace.sidebarLabel}>
          <span>
            {copy.workspace.currentRole}: {roleLabels[user.role][language]}
          </span>
          <span>
            {copy.workspace.currentLanguage}: {languageLabel}
          </span>
        </div>
        <div className="workspace-placeholder__toolbar-actions">
          <button
            className="workspace-placeholder__toolbar-link workspace-placeholder__toolbar-language"
            type="button"
            aria-label={copy.common.language}
            onClick={toggleLanguage}
          >
            <span className={language === "zh" ? "is-active" : ""}>CN</span>
            <span aria-hidden="true">/</span>
            <span className={language === "en" ? "is-active" : ""}>EN</span>
          </button>
          <Link href="/" className="workspace-placeholder__toolbar-link">
            {copy.workspace.homeLink}
          </Link>
          <button
            className="workspace-placeholder__toolbar-link"
            type="button"
            onClick={handleSignOut}
          >
            {copy.workspace.signOut}
          </button>
        </div>
      </header>

      <div className="workspace-placeholder__layout">
        <aside className="workspace-placeholder__sidebar">
          <Link href="/" className="workspace-placeholder__brand">
            <span>{copy.common.teamWorkspace}</span>
            <small>
              {copy.workspace.currentTeam}: {copy.common.teamShortName}
            </small>
          </Link>

          <nav
            className="workspace-placeholder__nav"
            aria-label={copy.workspace.sidebarLabel}
          >
            {copy.workspace.sidebarModules.map((moduleName, index) => (
              <button
                className={`workspace-placeholder__nav-item${
                  index === 0 ? " is-active" : ""
                }`}
                key={moduleName}
                type="button"
              >
                <span>{moduleName}</span>
              </button>
            ))}
            {user.role === "OWNER" ? (
              <Link
                className="workspace-placeholder__nav-item workspace-placeholder__nav-item--link"
                href="/workspace/settings/content"
              >
                <span>{copy.workspace.contentSettings}</span>
                <small>{copy.workspace.ownerOnly}</small>
              </Link>
            ) : null}
          </nav>
        </aside>

        <section className="workspace-placeholder__main">
          <header className="workspace-placeholder__header">
            <p className="workspace-placeholder__eyebrow">
              {copy.workspace.consoleEyebrow}
            </p>
            <h1>{copy.workspace.workspaceTitle}</h1>
            <p className="workspace-placeholder__subtitle">
              {copy.workspace.workspaceSubtitle}
            </p>
          </header>

          <section
            className="workspace-placeholder__metrics"
            aria-labelledby="workspace-metrics-title"
          >
            <div className="workspace-placeholder__section-head">
              <h2 id="workspace-metrics-title">
                {copy.workspace.metricsLabel}
              </h2>
              <span>
                {summary ? copy.workspace.reservedLabel : copy.workspace.loadingLabel}
              </span>
            </div>
            {summaryError ? (
              <p className="workspace-placeholder__status-message">
                {summaryError}
              </p>
            ) : null}

            <div className="workspace-placeholder__metric-grid">
              <article className="workspace-placeholder__metric-card workspace-placeholder__metric-card--overview">
                <span className="workspace-placeholder__metric-status">
                  {copy.workspace.reservedLabel}
                </span>
                <h3>{copy.workspace.operationsStatusTitle}</h3>
                <strong>{displayedMetricValues[0]}</strong>
                <p>{copy.workspace.operationsStatusSubtitle}</p>
                <div className="workspace-placeholder__overview-list">
                  {overviewRows.map((rowName) => (
                    <span key={rowName}>{rowName}</span>
                  ))}
                </div>
              </article>

              <article className="workspace-placeholder__metric-card workspace-placeholder__metric-card--medium">
                <span className="workspace-placeholder__metric-status">
                  {copy.workspace.reservedLabel}
                </span>
                <h3>{orderTitle}</h3>
                <strong>{displayedMetricValues[1]}</strong>
              </article>

              <article className="workspace-placeholder__metric-card workspace-placeholder__metric-card--medium">
                <span className="workspace-placeholder__metric-status">
                  {copy.workspace.reservedLabel}
                </span>
                <h3>{messageTitle}</h3>
                <strong>{displayedMetricValues[2]}</strong>
              </article>

              {[3, 4, 5].map((metricIndex) => (
                <article
                  className="workspace-placeholder__metric-card workspace-placeholder__metric-card--small"
                  key={copy.workspace.metrics[metricIndex]}
                >
                  <span className="workspace-placeholder__metric-status">
                    {copy.workspace.reservedLabel}
                  </span>
                  <h3>{copy.workspace.metrics[metricIndex]}</h3>
                  <strong>{displayedMetricValues[metricIndex] ?? "--"}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="workspace-placeholder__preview" aria-labelledby="workspace-preview-title">
            <div className="workspace-placeholder__preview-copy">
              <span>{copy.workspace.reservedLabel}</span>
              <h2 id="workspace-preview-title">{copy.workspace.workspacePreviewTitle}</h2>
              <p>{copy.workspace.workspacePreviewSubtitle}</p>
            </div>
            <div className="workspace-placeholder__preview-window" aria-hidden="true">
              <div className="workspace-placeholder__preview-topbar">
                <span />
                <span />
                <span />
              </div>
              <div className="workspace-placeholder__preview-body">
                <div className="workspace-placeholder__preview-rail">
                  {copy.workspace.previewLabels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
                <div className="workspace-placeholder__preview-main">
                  <div className="workspace-placeholder__preview-hero">
                    <strong>{copy.common.teamShortName}</strong>
                    <span>{copy.workspace.dashboard}</span>
                  </div>
                  <div className="workspace-placeholder__preview-modules">
                    {previewModules.map((moduleName) => (
                      <span key={moduleName}>{moduleName}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
