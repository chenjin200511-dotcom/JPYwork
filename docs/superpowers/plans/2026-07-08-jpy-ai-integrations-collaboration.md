# JPY AI Integrations Collaboration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strengthen JPY Team Workspace with an AI Copilot boundary, lightweight JSON webhook ingestion, external notification placeholders, and faster async collaboration controls without changing the current MVP login or compact Apple workspace style.

**Architecture:** Keep the system server-first and lightweight. Add small focused libraries under `lib/ai`, `lib/integrations`, and `lib/notifications`, then wire them into existing App Router API routes and reusable workspace UI. No third-party runtime dependency is introduced.

**Tech Stack:** Next.js App Router, React functional components, Prisma, Zod, Tailwind CSS v3 already present, existing CSS workspace layer, Framer Motion/Lucide where UI already uses them.

---

### Task 1: AI Copilot Core Boundary

**Files:**
- Create: `lib/ai/config.ts`
- Create: `lib/ai/context.ts`
- Create: `lib/ai/copilot.ts`
- Modify: `lib/workspace/briefing.ts`
- Modify: `components/workspace/app/PricingWorkbench.tsx`
- Test: `lib/ai/copilot.test.ts`

- [ ] Add `AI_TOTAL_TOKEN_LIMIT` and `AI_TEMPERATURE` parsing with safe defaults.
- [ ] Build a database-backed context snapshot that includes inventory alerts, pending approvals, pending pricing, risky orders, open messages, and open tasks.
- [ ] Add a prompt assembly interface that returns messages and metadata but does not call any paid AI service yet.
- [ ] Add a cost-control guard that falls back to the current rule-based briefing when AI is disabled, over budget, or throws.
- [ ] Surface the AI context metadata in briefing/pricing as compact Chinese internal labels.

### Task 2: Standard JSON Webhook Ingestion

**Files:**
- Create: `lib/integrations/webhookAuth.ts`
- Create: `lib/integrations/normalize.ts`
- Create: `app/api/webhooks/orders/route.ts`
- Create: `app/api/webhooks/listings/route.ts`
- Create: `app/api/webhooks/inventory/route.ts`
- Modify: `lib/api/schemas.ts`
- Test: `lib/integrations/normalize.test.ts`

- [ ] Add token authentication that reads only `INTEGRATION_WEBHOOK_TOKEN` from `.env`.
- [ ] Add normalized JSON schemas for orders, listings, and inventory while keeping Prisma enum values unchanged.
- [ ] Upsert orders by `platform + externalOrderId`, listings by `platform + sku`, and inventory by `sku`.
- [ ] Return Chinese, user-safe API errors on token or schema failure.
- [ ] Write audit/activity records without storing tokens or raw secrets.

### Task 3: External Notification Hook

**Files:**
- Create: `lib/notifications/externalNotification.ts`
- Modify: `app/api/pricing/[id]/submit/route.ts`
- Modify: `app/api/messages/[id]/escalate/route.ts`
- Modify: `app/api/orders/[id]/route.ts`
- Test: `lib/notifications/externalNotification.test.ts`

- [ ] Add `sendExternalNotification` placeholder that builds Markdown and checks `NOTIFICATION_WEBHOOK_URL`.
- [ ] Keep it no-op when the env var is absent.
- [ ] Trigger it when pricing is submitted for approval.
- [ ] Trigger it when customer service escalates a message.
- [ ] Trigger it when an order is updated into `RISK`, `HIGH`, or `CRITICAL`.

### Task 4: Activity Timeline Collaboration Controls

**Files:**
- Modify: `components/workspace/app/WorkspaceCrudPage.tsx`
- Modify: `styles/workspace-app.css`

- [ ] Add a micro “复制” button beside each activity entry.
- [ ] Add a micro “复制链接” button that creates a clean workspace link with entity type and id.
- [ ] Keep button style `text-xs`, compact, and non-disruptive.
- [ ] Use existing activity text translation helpers before copying.

### Task 5: Verification And Workflow Audit

**Files:**
- Modify tests only if needed.

- [ ] Run `npm run lint`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Verify `/workspace/briefing`, `/workspace/pricing`, `/workspace/integrations`, `/workspace/orders`, `/workspace/messages`, and `/workspace/tasks` still load after login.
- [ ] Record remaining UX gaps and risks in the final response.
