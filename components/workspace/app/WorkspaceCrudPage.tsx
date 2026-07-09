"use client";

// Purpose: Renders reusable workspace list/create/update pages backed by real APIs.
import { usePathname, useSearchParams } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { apiDownload, apiRequest } from "@/lib/client/apiClient";
import { useApi } from "@/lib/client/useApi";
import { useWorkspace } from "./WorkspaceAppShell";
import {
  actionLabel,
  enumLabel,
  entityLabel,
  type LocalizedText,
  translateActivityContent,
  uiText,
} from "./workspaceLabels";

export type WorkspaceRecord = {
  id: string;
  [key: string]: unknown;
};

export type FormField = {
  defaultValue?: string | number;
  label: LocalizedText;
  name: string;
  options?: string[];
  relation?: "users";
  required?: boolean;
  type: "datetime-local" | "number" | "select" | "text" | "textarea";
};

export type DisplayField = {
  key: string;
  label: LocalizedText;
  tone?: "mono" | "muted" | "strong";
};

export type CrudAction = {
  label: LocalizedText;
  onRun: (record: WorkspaceRecord) => Promise<void>;
  show?: (record: WorkspaceRecord) => boolean;
  tone?: "danger" | "primary";
};

export type CrudPageConfig = {
  activityEntityType?: string;
  createFields?: FormField[];
  createTitle?: LocalizedText;
  displayFields: DisplayField[];
  endpoint: string;
  exportEndpoint?: string;
  importEndpoint?: string;
  listKey: string;
  moduleKey: keyof ReturnType<typeof useWorkspace>["copy"]["modules"];
  patchMode?: "id" | "root";
  recordTitle: (record: WorkspaceRecord) => string;
  rowActions?: (helpers: {
    reload: () => void;
    setNotice: (notice: string) => void;
  }) => CrudAction[];
  statusField?: string;
  statusOptions?: string[];
};

type ListResponse = {
  page?: number;
  pageSize?: number;
  total?: number;
  [key: string]: unknown;
};

type AssignableUser = {
  email: string;
  id: string;
  name: string;
  role: string;
};

type ActivityResponse = {
  activities: Array<{
    action: string;
    content: string;
    createdAt: string;
    id: string;
  }>;
};

function decimalObjectText(value: unknown) {
  if (
    !value ||
    typeof value !== "object" ||
    !("d" in value) ||
    !Array.isArray(value.d) ||
    !("e" in value) ||
    typeof value.e !== "number"
  ) {
    return null;
  }

  const chunks = value.d as number[];
  const sign = "s" in value && value.s === -1 ? "-" : "";
  const digits = chunks
    .map((chunk, index) =>
      index === 0 ? String(chunk) : String(chunk).padEnd(7, "0"),
    )
    .join("");
  const decimalIndex = value.e + 1;
  const normalized =
    decimalIndex >= digits.length
      ? `${digits}${"0".repeat(decimalIndex - digits.length)}`
      : decimalIndex <= 0
        ? `0.${"0".repeat(Math.abs(decimalIndex))}${digits}`
        : `${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`;

  return `${sign}${normalized}`.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

function textValue(value: unknown, language: "en" | "zh") {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "object") {
    const decimalText = decimalObjectText(value);
    if (decimalText) {
      return decimalText;
    }

    if ("name" in value && typeof value.name === "string") {
      return value.name;
    }

    if ("email" in value && typeof value.email === "string") {
      return value.email;
    }

    return JSON.stringify(value);
  }

  const raw = String(value);
  const enumText = enumLabel(language, raw);
  if (enumText !== raw) {
    return enumText;
  }

  const actionText = actionLabel(language, raw);
  if (actionText !== raw) {
    return actionText;
  }

  const entityText = entityLabel(language, raw);
  if (entityText !== raw) {
    return entityText;
  }

  return translateActivityContent(language, raw);
}

function parseFieldValue(field: FormField, value: FormDataEntryValue | null) {
  const stringValue = String(value ?? "").trim();

  if (!stringValue && !field.required) {
    return undefined;
  }

  if (field.type === "number") {
    return Number(stringValue);
  }

  if (field.type === "datetime-local") {
    return new Date(stringValue).toISOString();
  }

  return stringValue;
}

function buildPayload(fields: FormField[], formData: FormData) {
  return fields.reduce<Record<string, unknown>>((payload, field) => {
    const value = parseFieldValue(field, formData.get(field.name));

    if (value !== undefined) {
      payload[field.name] = value;
    }

    return payload;
  }, {});
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(href);
}

function isWorkspaceRecord(value: unknown): value is WorkspaceRecord {
  return Boolean(value && typeof value === "object" && "id" in value);
}

function FieldControl({
  field,
  language,
  users,
}: {
  field: FormField;
  language: "en" | "zh";
  users: AssignableUser[];
}) {
  const defaultValue = field.defaultValue ?? "";

  if (field.relation === "users") {
    return (
      <label className="workspace-field">
        <span>{uiText(language, field.label)}</span>
        <select defaultValue={defaultValue} name={field.name} required={field.required}>
          <option value="">{language === "zh" ? "未分配" : "Unassigned"}</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} · {enumLabel(language, user.role)}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="workspace-field workspace-field--wide">
        <span>{uiText(language, field.label)}</span>
        <textarea
          defaultValue={defaultValue}
          name={field.name}
          required={field.required}
        />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="workspace-field">
        <span>{uiText(language, field.label)}</span>
        <select defaultValue={defaultValue} name={field.name} required={field.required}>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {enumLabel(language, option)}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="workspace-field">
      <span>{uiText(language, field.label)}</span>
      <input
        defaultValue={defaultValue}
        name={field.name}
        required={field.required}
        step={field.type === "number" ? "0.01" : undefined}
        type={field.type}
      />
    </label>
  );
}

export function WorkspaceCrudPage({ config }: { config: CrudPageConfig }) {
  const { copy, language } = useWorkspace();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const moduleCopy = copy.modules[config.moduleKey];
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [notice, setNotice] = useState("");
  const [csvInput, setCsvInput] = useState("");
  const [activityRecord, setActivityRecord] = useState<WorkspaceRecord | null>(null);
  const [directRecord, setDirectRecord] = useState<WorkspaceRecord | null>(null);
  const loadedDeepLinkIdRef = useRef("");
  const query = useMemo(() => {
    const params = new URLSearchParams({ pageSize: "40" });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (statusFilter) {
      params.set("status", statusFilter);
    }

    return `${config.endpoint}?${params.toString()}`;
  }, [config.endpoint, search, statusFilter]);
  const { data, error, isLoading, reload } = useApi<ListResponse>(query);
  const users = useApi<{ users: AssignableUser[] }>("/api/users");
  const activityUrl =
    activityRecord && config.activityEntityType
      ? `/api/activities?entityType=${encodeURIComponent(
          config.activityEntityType,
        )}&entityId=${encodeURIComponent(activityRecord.id)}&pageSize=20`
      : null;
  const activities = useApi<ActivityResponse>(activityUrl);
  const records = useMemo(
    () =>
      Array.isArray(data?.[config.listKey])
        ? (data?.[config.listKey] as WorkspaceRecord[])
        : [],
    [config.listKey, data],
  );
  const visibleRecords =
    directRecord && !records.some((record) => record.id === directRecord.id)
      ? [directRecord, ...records]
      : records;
  const actions = config.rowActions?.({ reload, setNotice }) ?? [];
  const deepLinkRecordId = searchParams.get("recordId") ?? searchParams.get("entityId");
  const deepLinkEntityType = searchParams.get("entityType");
  const deepLinkActivityId = searchParams.get("activityId");

  useEffect(() => {
    if (!config.activityEntityType || !deepLinkRecordId) {
      return;
    }

    if (deepLinkEntityType && deepLinkEntityType !== config.activityEntityType) {
      return;
    }

    const existingRecord = records.find((record) => record.id === deepLinkRecordId);

    if (existingRecord) {
      const frameId = window.requestAnimationFrame(() => {
        setDirectRecord(null);

        if (activityRecord?.id !== existingRecord.id) {
          setActivityRecord(existingRecord);
        }
      });

      return () => window.cancelAnimationFrame(frameId);
    }

    const loadKey = `${config.endpoint}:${deepLinkRecordId}`;
    if (loadedDeepLinkIdRef.current === loadKey) {
      return;
    }

    loadedDeepLinkIdRef.current = loadKey;
    void apiRequest<Record<string, unknown>>(`${config.endpoint}/${deepLinkRecordId}`)
      .then((response) => {
        const record = Object.values(response).find(isWorkspaceRecord);

        if (record) {
          setDirectRecord(record);
          setActivityRecord(record);
        }
      })
      .catch(() => {
        setNotice(language === "zh" ? "未找到链接中的记录" : "Linked record not found");
      });
  }, [
    activityRecord?.id,
    config.activityEntityType,
    config.endpoint,
    deepLinkEntityType,
    deepLinkRecordId,
    language,
    records,
  ]);

  useEffect(() => {
    if (!deepLinkActivityId || !activities.data?.activities.length) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      document.getElementById(`activity-${deepLinkActivityId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activities.data?.activities.length, deepLinkActivityId]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!config.createFields?.length) {
      return;
    }

    const form = event.currentTarget;
    const payload = buildPayload(config.createFields, new FormData(form));
    await apiRequest(config.endpoint, {
      body: payload,
      method: "POST",
    });
    form.reset();
    setNotice(`${moduleCopy.title}：${copy.actions.create}`);
    reload();
  }

  async function updateStatus(record: WorkspaceRecord, status: string) {
    const body =
      config.patchMode === "id"
        ? { [config.statusField as string]: status }
        : { id: record.id, [config.statusField as string]: status };
    const endpoint =
      config.patchMode === "id" ? `${config.endpoint}/${record.id}` : config.endpoint;

    await apiRequest(endpoint, {
      body,
      method: "PATCH",
    });
    setNotice(`${moduleCopy.title}：${enumLabel(language, status)}`);
    reload();
  }

  async function handleImport() {
    if (!config.importEndpoint || !csvInput.trim()) {
      return;
    }

    await apiRequest(config.importEndpoint, {
      body: { csv: csvInput },
      method: "POST",
    });
    setCsvInput("");
    setNotice(copy.actions.importCsv);
    reload();
  }

  async function handleExport() {
    if (!config.exportEndpoint) {
      return;
    }

    const csv = await apiDownload(config.exportEndpoint);
    downloadFile(`${config.moduleKey}.csv`, csv);
  }

  async function copyActivityText(activity: ActivityResponse["activities"][number]) {
    const activityText = [
      new Date(activity.createdAt).toLocaleString(),
      actionLabel(language, activity.action),
      translateActivityContent(language, activity.content),
    ].join(" / ");

    try {
      await navigator.clipboard.writeText(activityText);
      setNotice(language === "zh" ? "已复制动态文本" : "Activity copied");
    } catch {
      setNotice(language === "zh" ? "浏览器暂时无法写入剪贴板" : "Clipboard unavailable");
    }
  }

  async function copyActivityLink(activityId: string) {
    if (!activityRecord || !config.activityEntityType) {
      return;
    }

    const url = new URL(`${window.location.origin}${pathname}`);
    url.searchParams.set("entityType", config.activityEntityType);
    url.searchParams.set("recordId", activityRecord.id);
    url.searchParams.set("activityId", activityId);
    url.hash = `activity-${activityId}`;
    try {
      await navigator.clipboard.writeText(url.toString());
      setNotice(language === "zh" ? "已复制记录链接" : "Link copied");
    } catch {
      setNotice(language === "zh" ? "浏览器暂时无法写入剪贴板" : "Clipboard unavailable");
    }
  }

  return (
    <article className={`workspace-page workspace-page--${String(config.moduleKey)}`}>
      <header className="workspace-page__hero">
        <div>
          <p>{language === "zh" ? "JPY 团队工作区" : "JPY Team Workspace"}</p>
          <h1>{moduleCopy.title}</h1>
          <span>{moduleCopy.subtitle}</span>
        </div>
        <button
          className="workspace-button workspace-button--secondary"
          onClick={reload}
          type="button"
        >
          {copy.actions.refresh}
        </button>
      </header>

      <section className="workspace-card workspace-card--soft workspace-control-card">
        <div className="workspace-tools">
          <label className="workspace-search">
            <span>{copy.actions.search}</span>
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder={copy.common.searchPlaceholder}
              type="search"
              value={search}
            />
          </label>
          {config.statusOptions?.length ? (
            <label className="workspace-field workspace-field--compact">
              <span>{copy.common.status}</span>
              <select
                onChange={(event) => setStatusFilter(event.target.value)}
                value={statusFilter}
              >
                <option value="">{copy.common.all}</option>
                {config.statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {enumLabel(language, status)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="workspace-tools__actions">
            {config.exportEndpoint ? (
              <button
                className="workspace-button workspace-button--secondary"
                onClick={handleExport}
                type="button"
              >
                {copy.actions.downloadCsv}
              </button>
            ) : null}
          </div>
        </div>

        {config.createFields?.length ? (
          <form className="workspace-form" onSubmit={handleCreate}>
            <h2>
              {config.createTitle
                ? uiText(language, config.createTitle)
                : copy.actions.create}
            </h2>
            <div className="workspace-form__grid">
              {config.createFields.map((field) => (
                <FieldControl
                  field={field}
                  key={field.name}
                  language={language}
                  users={users.data?.users ?? []}
                />
              ))}
            </div>
            <button className="workspace-button" type="submit">
              {copy.actions.create}
            </button>
          </form>
        ) : null}

        {config.importEndpoint ? (
          <div className="workspace-import">
            <textarea
              onChange={(event) => setCsvInput(event.target.value)}
              placeholder={language === "zh" ? "粘贴 CSV 内容" : "Paste CSV content"}
              value={csvInput}
            />
            <button
              className="workspace-button workspace-button--secondary"
              onClick={handleImport}
              type="button"
            >
              {copy.actions.importCsv}
            </button>
          </div>
        ) : null}
      </section>

      {notice ? <p className="workspace-notice">{notice}</p> : null}
      {error ? <p className="workspace-error">{error}</p> : null}

      <section className="workspace-record-grid">
        {isLoading ? <div className="workspace-empty">{copy.common.loading}</div> : null}
        {!isLoading && !visibleRecords.length ? (
          <div className="workspace-empty">{copy.common.empty}</div>
        ) : null}
        {visibleRecords.map((record, index) => (
          <article
            className={`workspace-record-card workspace-record-card--${index % 4}${
              activityRecord?.id === record.id ? " is-selected" : ""
            }`}
            id={`record-${record.id}`}
            key={record.id}
          >
            <div className="workspace-record-card__head">
              <h2>{textValue(config.recordTitle(record), language)}</h2>
              {config.statusField ? (
                <select
                  onChange={(event) => void updateStatus(record, event.target.value)}
                  value={String(record[config.statusField] ?? "")}
                >
                  {config.statusOptions?.map((status) => (
                    <option key={status} value={status}>
                      {enumLabel(language, status)}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
            <dl>
              {config.displayFields.map((field) => (
                <div className={field.tone ? `is-${field.tone}` : ""} key={field.key}>
                  <dt>{uiText(language, field.label)}</dt>
                  <dd>{textValue(record[field.key], language)}</dd>
                </div>
              ))}
            </dl>
            <div className="workspace-record-card__actions">
              {config.activityEntityType ? (
                <button
                  className="workspace-mini-button"
                  onClick={() => setActivityRecord(record)}
                  type="button"
                >
                  {language === "zh" ? "动态记录" : "Activity"}
                </button>
              ) : null}
              {actions
                .filter((action) => !action.show || action.show(record))
                .map((action) => (
                  <button
                    className={`workspace-mini-button${
                      action.tone === "danger" ? " workspace-mini-button--danger" : ""
                    }`}
                    key={uiText(language, action.label)}
                    onClick={() => void action.onRun(record)}
                    type="button"
                  >
                    {uiText(language, action.label)}
                  </button>
                ))}
            </div>
          </article>
        ))}
      </section>

      {activityRecord && config.activityEntityType ? (
        <section className="workspace-card workspace-activity-panel">
          <div className="workspace-section-head">
            <h2>
              {language === "zh" ? "动态记录" : "Activity"} ·{" "}
              {textValue(config.recordTitle(activityRecord), language)}
            </h2>
            <button
              className="workspace-mini-button"
              onClick={() => setActivityRecord(null)}
              type="button"
            >
              {language === "zh" ? "关闭" : "Close"}
            </button>
          </div>
          <form
            className="workspace-note-form"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const formData = new FormData(form);
              const content = String(formData.get("content") ?? "").trim();

              if (!content) {
                return;
              }

              void apiRequest("/api/activities", {
                body: {
                  action: "note",
                  content,
                  entityId: activityRecord.id,
                  entityType: config.activityEntityType,
                },
                method: "POST",
              }).then(() => {
                form.reset();
                activities.reload();
              });
            }}
          >
            <input
              name="content"
              placeholder={language === "zh" ? "添加内部备注" : "Internal note"}
            />
            <button className="workspace-mini-button" type="submit">
              {copy.actions.send}
            </button>
          </form>
          {activities.error ? <p className="workspace-error">{activities.error}</p> : null}
          <div className="workspace-activity-list workspace-activity-list--panel">
            {(activities.data?.activities ?? []).map((activity) => (
              <div
                className={`workspace-activity-row${
                  deepLinkActivityId === activity.id ? " is-linked" : ""
                }`}
                id={`activity-${activity.id}`}
                key={activity.id}
              >
                <span>{new Date(activity.createdAt).toLocaleString()}</span>
                <strong>{actionLabel(language, activity.action)}</strong>
                <p>{translateActivityContent(language, activity.content)}</p>
                <div className="workspace-activity-actions">
                  <button
                    className="workspace-mini-button workspace-mini-button--micro"
                    onClick={() => void copyActivityText(activity)}
                    type="button"
                  >
                    {language === "zh" ? "复制" : "Copy"}
                  </button>
                  <button
                    className="workspace-mini-button workspace-mini-button--micro"
                    onClick={() => void copyActivityLink(activity.id)}
                    type="button"
                  >
                    {language === "zh" ? "复制链接" : "Copy link"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

export function WorkspacePanel({
  children,
  subtitle,
  title,
}: {
  children: ReactNode;
  subtitle: string;
  title: string;
}) {
  const { language } = useWorkspace();

  return (
    <article className="workspace-page">
      <header className="workspace-page__hero">
        <div>
          <p>{language === "zh" ? "JPY 团队工作区" : "JPY Team Workspace"}</p>
          <h1>{title}</h1>
          <span>{subtitle}</span>
        </div>
      </header>
      {children}
    </article>
  );
}
