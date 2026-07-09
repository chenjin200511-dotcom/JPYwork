# JPY Owner System Config And Webhook Logs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Owner-only system configuration page, persistent webhook ingestion logs, notification configuration status, and real activity deep-link opening.

**Architecture:** Keep the MVP lightweight by using existing `AuditLog` rows for webhook log persistence instead of adding a new Prisma model. Add small server-side config helpers, Owner-only API routes, one compact workspace settings page, and generic CRUD deep-link hydration.

**Tech Stack:** Next.js App Router, React client components, Prisma, existing RBAC, existing compact Apple-style workspace CSS.

---

### Task 1: Server Config And Webhook Log Core

**Files:**
- Create: `lib/webhooks/config.ts`
- Create: `lib/webhooks/logs.ts`
- Create: `lib/notifications/config.ts`
- Modify: `app/api/webhooks/orders/route.ts`
- Modify: `app/api/webhooks/listings/route.ts`
- Modify: `app/api/webhooks/inventory/route.ts`

- [ ] Create safe runtime config helpers that expose only configured/missing state, not secrets.
- [ ] Create webhook log helpers backed by `AuditLog` with `WebhookIngestion` entity type.
- [ ] Record success and failure logs in all three JSON webhook endpoints.

### Task 2: Owner APIs

**Files:**
- Create: `app/api/system/config/route.ts`
- Create: `app/api/system/notifications/test/route.ts`
- Create: `app/api/webhooks/logs/route.ts`

- [ ] Add Owner-only config API using `api.manage`.
- [ ] Add Owner-only webhook log API with recent records and summary.
- [ ] Add Owner-only notification test endpoint that uses `NOTIFICATION_WEBHOOK_URL`.

### Task 3: Owner System Settings Page

**Files:**
- Create: `components/workspace/app/WorkspaceSystemSettingsPage.tsx`
- Create: `app/workspace/settings/system/page.tsx`
- Modify: `components/workspace/app/WorkspaceAppShell.tsx`
- Modify: `components/workspace/app/workspaceText.ts`
- Modify: `styles/workspace-app.css`

- [ ] Add sidebar item visible only to Owner.
- [ ] Add compact status cards for AI, Webhook, Notification, and recent sync.
- [ ] Show webhook endpoints, failure reasons, and recent sync records.
- [ ] Show notification env configuration status and provide test button.

### Task 4: Activity Deep Links

**Files:**
- Modify: `components/workspace/app/WorkspaceCrudPage.tsx`
- Modify: `styles/workspace-app.css`

- [ ] Copy links with `recordId`, `activityId`, and hash.
- [ ] On page load, hydrate the actual record panel from query params.
- [ ] Scroll to the exact activity row after the activity list loads.
- [ ] Highlight the selected record card.

### Task 5: Verification

**Files:**
- Modify: `package.json`
- Add focused tests if a logic edge case appears.

- [ ] Run `npm run lint`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Use the browser to check `/workspace/settings/system`, `/workspace/pricing`, and `/workspace` locked state.
