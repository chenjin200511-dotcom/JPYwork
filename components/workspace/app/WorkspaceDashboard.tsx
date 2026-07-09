"use client";

// Purpose: Shows the live JPY workspace dashboard from database-backed summary APIs.
import Link from "next/link";
import { useApi } from "@/lib/client/useApi";
import { useWorkspace } from "./WorkspaceAppShell";
import {
  actionLabel,
  entityLabel,
  enumLabel,
  translateActivityContent,
} from "./workspaceLabels";

type Activity = {
  action: string;
  content: string;
  createdAt: string;
  entityType: string;
  id: string;
  user?: {
    name: string;
  };
};

type Briefing = {
  contentJson: {
    highlights?: string[];
    risks?: string[];
    focus?: string[];
  };
  createdAt: string;
  id: string;
  type: string;
} | null;

type DashboardSummary = {
  inventoryAlerts: number;
  listingsInProgress: number;
  messagesWaiting: number;
  myTasks: number;
  orderRisks: number;
  overdueTasks: number;
  pendingApprovals: number;
  pendingPricing: number;
  recentActivities: Activity[];
  todayBriefing: Briefing;
};

const quickLinks = [
  { href: "/workspace/tasks", key: "tasks" },
  { href: "/workspace/messages", key: "messages" },
  { href: "/workspace/orders", key: "orders" },
  { href: "/workspace/pricing", key: "pricing" },
  { href: "/workspace/briefing", key: "briefing" },
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

export function WorkspaceDashboard() {
  const { copy, language } = useWorkspace();
  const { data, error, isLoading, reload } =
    useApi<DashboardSummary>("/api/dashboard/summary");
  const metrics = data
    ? [
        ["myTasks", data.myTasks],
        ["overdueTasks", data.overdueTasks],
        ["messagesWaiting", data.messagesWaiting],
        ["orderRisks", data.orderRisks],
        ["listingsInProgress", data.listingsInProgress],
        ["pendingPricing", data.pendingPricing],
        ["pendingApprovals", data.pendingApprovals],
        ["inventoryAlerts", data.inventoryAlerts],
      ]
    : [];

  return (
    <article className="workspace-page workspace-dashboard">
      <header className="workspace-dashboard__hero">
        <div>
          <p>{language === "zh" ? "JPY 团队工作区" : "JPY Team Workspace"}</p>
          <h1>{copy.dashboard.heroTitle}</h1>
          <span>{copy.dashboard.heroSubtitle}</span>
        </div>
        <button className="workspace-button" onClick={reload} type="button">
          {copy.actions.refresh}
        </button>
      </header>

      {error ? <p className="workspace-error">{error}</p> : null}
      {isLoading ? <p className="workspace-notice">{copy.common.loading}</p> : null}

      <section className="workspace-dashboard__metrics">
        {metrics.map(([key, value], index) => (
          <article
            className={`workspace-metric workspace-metric--${index === 0 ? "large" : "small"}`}
            key={key}
          >
            <span>
              {copy.dashboard.metrics[key as keyof typeof copy.dashboard.metrics]}
            </span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className="workspace-dashboard__split">
        <article className="workspace-card workspace-card--preview">
          <div>
            <p>{copy.dashboard.quickActions}</p>
            <h2>JPY</h2>
          </div>
          <div className="workspace-preview-board">
            {quickLinks.map((link) => (
              <Link href={link.href} key={link.href}>
                {copy.nav[link.key]}
              </Link>
            ))}
          </div>
        </article>

        <article className="workspace-card">
          <div className="workspace-section-head">
            <h2>{copy.dashboard.briefing}</h2>
            <Link href="/workspace/briefing">{copy.nav.briefing}</Link>
          </div>
          {data?.todayBriefing ? (
            <div className="workspace-briefing-mini">
              <strong>{enumLabel(language, data.todayBriefing.type)}</strong>
              {(data.todayBriefing.contentJson.highlights ?? [])
                .slice(0, 3)
                .map((item) => (
                  <p key={item}>{item}</p>
                ))}
            </div>
          ) : (
            <p className="workspace-muted">{copy.common.empty}</p>
          )}
        </article>

        <article className="workspace-card workspace-card--wide">
          <div className="workspace-section-head">
            <h2>{copy.dashboard.activity}</h2>
            <Link href="/workspace/audit">{copy.nav.audit}</Link>
          </div>
          <div className="workspace-activity-list">
            {(data?.recentActivities ?? []).map((activity) => (
              <div key={activity.id}>
                <span>{formatDate(activity.createdAt)}</span>
                <strong>{entityLabel(language, activity.entityType)}</strong>
                <p>
                  {activity.content
                    ? translateActivityContent(language, activity.content)
                    : actionLabel(language, activity.action)}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </article>
  );
}
