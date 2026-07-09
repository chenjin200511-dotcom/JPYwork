"use client";

// Purpose: Renders a compact Apple-style pricing calculator and approval queue.
import { FormEvent, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  Calculator,
  Check,
  Clock3,
  RefreshCw,
  Send,
  ShieldAlert,
  X,
} from "lucide-react";
import { apiRequest } from "@/lib/client/apiClient";
import { useApi } from "@/lib/client/useApi";
import { buildPricingPrompt } from "@/lib/ai/prompts";
import {
  calculatePricing,
  type PricingInput,
  type PricingOutput,
} from "@/lib/workspace/pricing";
import { useWorkspace } from "./WorkspaceAppShell";
import type { WorkspaceRecord } from "./WorkspaceCrudPage";
import { enumLabel } from "./workspaceLabels";

type PricingRuleRecord = WorkspaceRecord & {
  adCost?: string | number;
  campaignFloorPrice?: string | number;
  cost?: string | number;
  domesticShipping?: string | number;
  exchangeRate?: string | number;
  internationalShipping?: string | number;
  minimumPrice?: string | number;
  packagingCost?: string | number;
  paymentFeeRate?: string | number;
  platformFeeRate?: string | number;
  productName?: string;
  returnLossRate?: string | number;
  sku?: string;
  status?: string;
  suggestedPrice?: string | number;
  targetMarginRate?: string | number;
  taxReserveRate?: string | number;
  updatedAt?: string;
};

type PricingListResponse = {
  page?: number;
  pageSize?: number;
  pricingRules: PricingRuleRecord[];
  total?: number;
};

type PricingFormState = PricingInput & {
  productName: string;
  sku: string;
};

const statusOptions = ["", "DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED"];

const initialForm: PricingFormState = {
  adCost: 0,
  cost: 0,
  domesticShipping: 0,
  exchangeRate: 1,
  internationalShipping: 0,
  packagingCost: 0,
  paymentFeeRate: 0.03,
  platformFeeRate: 0.08,
  productName: "",
  returnLossRate: 0.02,
  sku: "",
  targetMarginRate: 0.2,
  taxReserveRate: 0,
};

const copy = {
  en: {
    actions: {
      approve: "Approve",
      refresh: "Refresh",
      reject: "Reject",
      reset: "Reset",
      submit: "Submit approval",
    },
    fields: {
      adCost: "Ad cost",
      cost: "Product cost",
      domesticShipping: "Domestic shipping",
      exchangeRate: "Exchange rate",
      internationalShipping: "International shipping",
      packagingCost: "Packaging cost",
      paymentFeeRate: "Payment fee rate",
      platformFeeRate: "Platform fee rate",
      productName: "Product name",
      returnLossRate: "Return loss rate",
      sku: "SKU",
      targetMarginRate: "Target margin rate",
      taxReserveRate: "Tax reserve rate",
    },
    helper: "Enter cost, fee, shipping, and risk values. The right panel updates instantly before you submit approval.",
    metrics: {
      campaignFloorPrice: "Campaign floor",
      expectedGrossMarginRate: "Gross margin",
      expectedGrossProfit: "Gross profit",
      minimumPrice: "Break-even floor",
      riskLevel: "Risk level",
      suggestedPrice: "Suggested price",
      totalCost: "Total cost",
    },
    placeholders: {
      productName: "Shopee listing name",
      search: "Search SKU or product",
      sku: "SKU-001",
    },
    sections: {
      ai: "AI prompt boundary",
      calculator: "Live calculator",
      filters: "Approval queue",
      form: "Pricing inputs",
      queue: "Recent pricing requests",
    },
    status: {
      approved: "Approved and locked",
      rejected: "Rejected for revision",
    },
    subtitle:
      "A compact pricing desk for cost floor, campaign floor, owner approval, and execution rhythm.",
    title: "Pricing workbench",
  },
  zh: {
    actions: {
      approve: "审批通过",
      refresh: "刷新",
      reject: "驳回定价",
      reset: "清空",
      submit: "提交审批",
    },
    fields: {
      adCost: "广告成本",
      cost: "商品成本",
      domesticShipping: "国内运费",
      exchangeRate: "汇率",
      internationalShipping: "国际物流费",
      packagingCost: "包材成本",
      paymentFeeRate: "支付手续费率",
      platformFeeRate: "平台佣金率",
      productName: "商品名称",
      returnLossRate: "退货损耗率",
      sku: "SKU",
      targetMarginRate: "目标毛利率",
      taxReserveRate: "税费预留率",
    },
    helper:
      "输入成本、费率、物流和损耗，右侧实时计算底价、建议售价和风险等级，再提交负责人审批。",
    metrics: {
      campaignFloorPrice: "活动底价",
      expectedGrossMarginRate: "预估毛利率",
      expectedGrossProfit: "预估毛利",
      minimumPrice: "最低不亏价",
      riskLevel: "风险等级",
      suggestedPrice: "建议售价",
      totalCost: "总成本",
    },
    placeholders: {
      productName: "Shopee 商品名称",
      search: "搜索 SKU 或商品",
      sku: "SKU-001",
    },
    sections: {
      ai: "AI 策略预留",
      calculator: "实时计算",
      filters: "审批队列",
      form: "定价输入",
      queue: "近期定价申请",
    },
    status: {
      approved: "已审批锁定",
      rejected: "已驳回待修正",
    },
    subtitle: "面向跨境电商的紧凑定价工作台，集中处理成本底线、活动底价、负责人审批和执行节奏。",
    title: "定价系统",
  },
};

function numeric(value: string | number | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number, digits = 2) {
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function formatRate(value: number) {
  return `${formatNumber(value * 100, 1)}%`;
}

function metricTone(riskLevel: PricingOutput["riskLevel"]) {
  if (riskLevel === "HIGH") {
    return "is-high";
  }

  if (riskLevel === "MEDIUM") {
    return "is-medium";
  }

  return "is-low";
}

function riskLabel(language: "en" | "zh", riskLevel: PricingOutput["riskLevel"]) {
  if (language === "en") {
    return riskLevel === "HIGH" ? "High risk" : riskLevel === "MEDIUM" ? "Medium risk" : "Low risk";
  }

  return riskLevel === "HIGH" ? "高风险" : riskLevel === "MEDIUM" ? "中风险" : "低风险";
}

function AnimatedValue({
  children,
  valueKey,
}: {
  children: string;
  valueKey: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <strong>{children}</strong>;
  }

  return (
    <AnimatePresence mode="popLayout">
      <motion.strong
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        initial={{ opacity: 0, y: 4 }}
        key={valueKey}
        transition={{ damping: 24, stiffness: 360, type: "spring" }}
      >
        {children}
      </motion.strong>
    </AnimatePresence>
  );
}

function PricingField({
  label,
  max,
  min = 0,
  name,
  onChange,
  step = 0.01,
  value,
}: {
  label: string;
  max?: number;
  min?: number;
  name: keyof PricingFormState;
  onChange: (name: keyof PricingFormState, value: string) => void;
  step?: number;
  value: number | string;
}) {
  return (
    <label className="pricing-input">
      <span>{label}</span>
      <input
        max={max}
        min={min}
        name={name}
        onChange={(event) => onChange(name, event.target.value)}
        step={step}
        type="number"
        value={value}
      />
    </label>
  );
}

function canSubmit(form: PricingFormState) {
  return Boolean(form.sku.trim() && form.productName.trim() && form.cost > 0);
}

export function PricingWorkbench() {
  const { language, user } = useWorkspace();
  const text = copy[language];
  const [form, setForm] = useState<PricingFormState>(initialForm);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [notice, setNotice] = useState("");
  const shouldReduceMotion = useReducedMotion();

  const query = useMemo(() => {
    const params = new URLSearchParams({ pageSize: "24" });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (status) {
      params.set("status", status);
    }

    return `/api/pricing-rules?${params.toString()}`;
  }, [search, status]);
  const { data, error, isLoading, reload } = useApi<PricingListResponse>(query);

  const calculated = useMemo(
    () =>
      calculatePricing({
        adCost: numeric(form.adCost),
        cost: numeric(form.cost),
        domesticShipping: numeric(form.domesticShipping),
        exchangeRate: numeric(form.exchangeRate) || 1,
        internationalShipping: numeric(form.internationalShipping),
        packagingCost: numeric(form.packagingCost),
        paymentFeeRate: numeric(form.paymentFeeRate),
        platformFeeRate: numeric(form.platformFeeRate),
        returnLossRate: numeric(form.returnLossRate),
        targetMarginRate: numeric(form.targetMarginRate),
        taxReserveRate: numeric(form.taxReserveRate),
      }),
    [form],
  );
  const pricingPrompt = useMemo(
    () =>
      buildPricingPrompt({
        output: calculated,
        productName: form.productName,
        sku: form.sku,
      }),
    [calculated, form.productName, form.sku],
  );

  const records = data?.pricingRules ?? [];

  function updateField(name: keyof PricingFormState, value: string) {
    setForm((current) => ({
      ...current,
      [name]: name === "productName" || name === "sku" ? value : numeric(value),
    }));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit(form)) {
      return;
    }

    await apiRequest<{ calculated: PricingOutput; pricingRule: PricingRuleRecord }>(
      "/api/pricing-rules",
      {
        body: {
          adCost: numeric(form.adCost),
          cost: numeric(form.cost),
          domesticShipping: numeric(form.domesticShipping),
          exchangeRate: numeric(form.exchangeRate) || 1,
          internationalShipping: numeric(form.internationalShipping),
          packagingCost: numeric(form.packagingCost),
          paymentFeeRate: numeric(form.paymentFeeRate),
          platformFeeRate: numeric(form.platformFeeRate),
          productName: form.productName.trim(),
          returnLossRate: numeric(form.returnLossRate),
          sku: form.sku.trim(),
          targetMarginRate: numeric(form.targetMarginRate),
          taxReserveRate: numeric(form.taxReserveRate),
        },
        method: "POST",
      },
    );
    setNotice(language === "zh" ? "定价申请已创建，可提交审批。" : "Pricing request created.");
    reload();
  }

  async function runAction(record: PricingRuleRecord, action: "approve" | "reject" | "submit") {
    await apiRequest(`/api/pricing/${record.id}/${action}`, {
      body: {},
      method: "POST",
    });
    setNotice(
      action === "approve"
        ? text.actions.approve
        : action === "reject"
          ? text.actions.reject
          : text.actions.submit,
    );
    reload();
  }

  const metricItems = [
    {
      key: "suggestedPrice",
      label: text.metrics.suggestedPrice,
      value: formatNumber(calculated.suggestedPrice),
    },
    {
      key: "minimumPrice",
      label: text.metrics.minimumPrice,
      value: formatNumber(calculated.minimumPrice),
    },
    {
      key: "campaignFloorPrice",
      label: text.metrics.campaignFloorPrice,
      value: formatNumber(calculated.campaignFloorPrice),
    },
    {
      key: "expectedGrossProfit",
      label: text.metrics.expectedGrossProfit,
      value: formatNumber(calculated.expectedGrossProfit),
    },
    {
      key: "expectedGrossMarginRate",
      label: text.metrics.expectedGrossMarginRate,
      value: formatRate(calculated.expectedGrossMarginRate),
    },
    {
      key: "totalCost",
      label: text.metrics.totalCost,
      value: formatNumber(calculated.totalCost),
    },
  ];

  return (
    <article className="workspace-page pricing-workbench">
      <header className="workspace-page__hero pricing-workbench__hero">
        <div>
          <p>JPY Team Workspace</p>
          <h1>{text.title}</h1>
          <span>{text.subtitle}</span>
        </div>
        <button
          className="workspace-button workspace-button--secondary"
          onClick={reload}
          type="button"
        >
          <RefreshCw aria-hidden="true" size={14} />
          {text.actions.refresh}
        </button>
      </header>

      {notice ? <p className="workspace-notice">{notice}</p> : null}
      {error ? <p className="workspace-error">{error}</p> : null}

      <section className="pricing-workbench__layout">
        <motion.form
          className="workspace-card pricing-panel pricing-panel--inputs"
          layout={!shouldReduceMotion}
          onSubmit={handleCreate}
        >
          <div className="pricing-panel__head">
            <div>
              <span>{text.sections.form}</span>
              <h2>{text.helper}</h2>
            </div>
            <button
              className="workspace-mini-button"
              onClick={() => setForm(initialForm)}
              type="button"
            >
              {text.actions.reset}
            </button>
          </div>

          <div className="pricing-core-grid">
            <label className="pricing-input pricing-input--wide">
              <span>{text.fields.sku}</span>
              <input
                name="sku"
                onChange={(event) => updateField("sku", event.target.value)}
                placeholder={text.placeholders.sku}
                type="text"
                value={form.sku}
              />
            </label>
            <label className="pricing-input pricing-input--wide">
              <span>{text.fields.productName}</span>
              <input
                name="productName"
                onChange={(event) => updateField("productName", event.target.value)}
                placeholder={text.placeholders.productName}
                type="text"
                value={form.productName}
              />
            </label>
            <PricingField
              label={text.fields.cost}
              name="cost"
              onChange={updateField}
              value={form.cost}
            />
            <PricingField
              label={text.fields.domesticShipping}
              name="domesticShipping"
              onChange={updateField}
              value={form.domesticShipping}
            />
            <PricingField
              label={text.fields.internationalShipping}
              name="internationalShipping"
              onChange={updateField}
              value={form.internationalShipping}
            />
            <PricingField
              label={text.fields.packagingCost}
              name="packagingCost"
              onChange={updateField}
              value={form.packagingCost}
            />
            <PricingField
              label={text.fields.adCost}
              name="adCost"
              onChange={updateField}
              value={form.adCost}
            />
            <PricingField
              label={text.fields.exchangeRate}
              min={0.0001}
              name="exchangeRate"
              onChange={updateField}
              step={0.0001}
              value={form.exchangeRate}
            />
          </div>

          <div className="pricing-rate-grid">
            <PricingField
              label={text.fields.targetMarginRate}
              max={1}
              name="targetMarginRate"
              onChange={updateField}
              step={0.01}
              value={form.targetMarginRate}
            />
            <PricingField
              label={text.fields.platformFeeRate}
              max={1}
              name="platformFeeRate"
              onChange={updateField}
              step={0.01}
              value={form.platformFeeRate}
            />
            <PricingField
              label={text.fields.paymentFeeRate}
              max={1}
              name="paymentFeeRate"
              onChange={updateField}
              step={0.01}
              value={form.paymentFeeRate}
            />
            <PricingField
              label={text.fields.taxReserveRate}
              max={1}
              name="taxReserveRate"
              onChange={updateField}
              step={0.01}
              value={form.taxReserveRate}
            />
            <PricingField
              label={text.fields.returnLossRate}
              max={1}
              name="returnLossRate"
              onChange={updateField}
              step={0.01}
              value={form.returnLossRate}
            />
          </div>

          <button
            className="workspace-button pricing-submit"
            disabled={!canSubmit(form)}
            type="submit"
          >
            <Send aria-hidden="true" size={14} />
            {text.actions.submit}
          </button>
        </motion.form>

        <aside className="pricing-workbench__side">
          <motion.section
            className={`workspace-card pricing-panel pricing-calculator ${metricTone(
              calculated.riskLevel,
            )}`}
            layout={!shouldReduceMotion}
          >
            <div className="pricing-panel__head">
              <div>
                <span>{text.sections.calculator}</span>
                <h2>{text.metrics.suggestedPrice}</h2>
              </div>
              <Calculator aria-hidden="true" size={17} />
            </div>
            <div className="pricing-hero-number">
              <AnimatedValue
                valueKey={`suggested-${calculated.suggestedPrice}`}
              >
                {formatNumber(calculated.suggestedPrice)}
              </AnimatedValue>
              <span>{text.metrics.riskLevel}: {riskLabel(language, calculated.riskLevel)}</span>
            </div>
            <div className="pricing-metric-grid">
              {metricItems.map((metric) => (
                <motion.div
                  className="pricing-metric"
                  key={metric.key}
                  whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                >
                  <span>{metric.label}</span>
                  <AnimatedValue valueKey={`${metric.key}-${metric.value}`}>
                    {metric.value}
                  </AnimatedValue>
                </motion.div>
              ))}
            </div>
            <div className="pricing-ai-context">
              <span>{text.sections.ai}</span>
              <strong>{pricingPrompt.estimatedTokens}</strong>
              <em>tokens</em>
            </div>
          </motion.section>

          <section className="workspace-card pricing-panel pricing-panel--queue">
            <div className="pricing-panel__head">
              <div>
                <span>{text.sections.filters}</span>
                <h2>{text.sections.queue}</h2>
              </div>
              <span className="pricing-count">{data?.total ?? records.length}</span>
            </div>
            <div className="pricing-filter-row">
              <input
                onChange={(event) => setSearch(event.target.value)}
                placeholder={text.placeholders.search}
                type="search"
                value={search}
              />
              <select onChange={(event) => setStatus(event.target.value)} value={status}>
                {statusOptions.map((option) => (
                  <option key={option || "all"} value={option}>
                    {option ? enumLabel(language, option) : language === "zh" ? "全部状态" : "All"}
                  </option>
                ))}
              </select>
            </div>

            <div className="pricing-queue-list">
              {isLoading ? <p className="workspace-muted">{language === "zh" ? "加载中..." : "Loading..."}</p> : null}
              {!isLoading && !records.length ? (
                <p className="workspace-muted">{language === "zh" ? "暂无定价申请。" : "No pricing requests."}</p>
              ) : null}
              {records.map((record) => {
                const isPending = record.status === "PENDING_APPROVAL";
                const isApproved = record.status === "APPROVED";
                const isRejected = record.status === "REJECTED";

                return (
                  <motion.article
                    className="pricing-queue-card"
                    key={record.id}
                    layout={!shouldReduceMotion}
                    whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.995 }}
                  >
                    <div className="pricing-queue-card__top">
                      <div>
                        <strong>{record.productName || "-"}</strong>
                        <span>{record.sku || "-"}</span>
                      </div>
                      <span className="workspace-status-pill">
                        {enumLabel(language, record.status)}
                      </span>
                    </div>
                    <dl>
                      <div>
                        <dt>{text.metrics.suggestedPrice}</dt>
                        <dd>{formatNumber(numeric(record.suggestedPrice))}</dd>
                      </div>
                      <div>
                        <dt>{text.metrics.minimumPrice}</dt>
                        <dd>{formatNumber(numeric(record.minimumPrice))}</dd>
                      </div>
                      <div>
                        <dt>{text.metrics.campaignFloorPrice}</dt>
                        <dd>{formatNumber(numeric(record.campaignFloorPrice))}</dd>
                      </div>
                    </dl>
                    <div className="pricing-queue-card__actions">
                      {record.status === "DRAFT" || isRejected ? (
                        <button
                          className="workspace-mini-button"
                          onClick={() => void runAction(record, "submit")}
                          type="button"
                        >
                          <Clock3 aria-hidden="true" size={12} />
                          {text.actions.submit}
                        </button>
                      ) : null}
                      {user.role === "OWNER" && isPending ? (
                        <>
                          <button
                            className="workspace-mini-button"
                            onClick={() => void runAction(record, "approve")}
                            type="button"
                          >
                            <Check aria-hidden="true" size={12} />
                            {text.actions.approve}
                          </button>
                          <button
                            className="workspace-mini-button workspace-mini-button--danger"
                            onClick={() => void runAction(record, "reject")}
                            type="button"
                          >
                            <X aria-hidden="true" size={12} />
                            {text.actions.reject}
                          </button>
                        </>
                      ) : null}
                    </div>
                    <AnimatePresence>
                      {isApproved || isRejected ? (
                        <motion.div
                          animate={{ opacity: 1 }}
                          className="pricing-state-overlay"
                          exit={{ opacity: 0 }}
                          initial={{ opacity: 0 }}
                        >
                          {isApproved ? (
                            <BadgeCheck aria-hidden="true" size={14} />
                          ) : (
                            <ShieldAlert aria-hidden="true" size={14} />
                          )}
                          <span>{isApproved ? text.status.approved : text.status.rejected}</span>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.article>
                );
              })}
            </div>
          </section>
        </aside>
      </section>
    </article>
  );
}
