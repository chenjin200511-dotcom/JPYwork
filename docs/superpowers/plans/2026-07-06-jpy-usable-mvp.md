# JPY Usable MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a database-backed JPY Team Workspace MVP that the three-person team can use daily for tasks, messages, orders, listings, pricing approvals, inventory, briefings, integrations, content/theme, and audit logs.

**Architecture:** Preserve the public Apple-style homepage and replace the reserved workspace placeholder with an authenticated workspace app shell. Use Prisma-backed route handlers for all core modules, shared Zod validation, RBAC checks, Activity and Audit logging, and client-side React forms/lists that call the APIs directly.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind/CSS, Prisma 7, PostgreSQL schema plus SQLite local fallback, Zod, bcryptjs, httpOnly cookie sessions.

---

### Task 1: Expand Data Model And Seed

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/schema.sqlite.prisma`
- Modify: `prisma/seed.ts`
- Modify: `lib/api/schemas.ts`
- Modify: `lib/api/serializers.ts`

- [ ] Add required enums: `Priority`, `MessageStatus`, `RiskLevel`, `ListingStatus`, `ApprovalStatus`, `InventoryStatus`, `ApprovalType`, `DailyBriefingType`.
- [ ] Expand `Task`, `Order`, `PricingRule`, and `ApiConnection` with the MVP fields.
- [ ] Add `CustomerMessage`, `MessageTemplate`, `Listing`, `Approval`, `InventoryItem`, `Activity`, and `DailyBriefing`.
- [ ] Add seed data for all modules: tasks assigned to all three users, messages, templates, risky orders, listings, pricing requests, approvals, inventory warnings, activities, and daily briefing.
- [ ] Run `npm run db:sqlite:generate`.
- [ ] Recreate or migrate local SQLite fallback, then run `npm run db:sqlite:seed`.

### Task 2: Backend API Surface

**Files:**
- Create/modify route handlers under `app/api/**`
- Modify: `lib/auth/permissions.ts`
- Create: `lib/api/pagination.ts`
- Create: `lib/api/csv.ts`
- Create: `lib/workspace/activity.ts`
- Create: `lib/workspace/pricing.ts`
- Create: `lib/workspace/briefing.ts`

- [ ] Implement module APIs: tasks, messages, message templates, orders, listings, pricing, approvals, inventory, activities, briefings, integrations, audit.
- [ ] Ensure every protected route calls `requireUser` or `requirePermission`.
- [ ] Ensure every POST/PATCH validates with Zod.
- [ ] Ensure create/update/approve/resolve/import/export operations write `Activity` and important operations write `AuditLog`.
- [ ] Add CSV import/export for orders, listings, and inventory.
- [ ] Add pricing calculation and pricing submit/approve/reject endpoints.
- [ ] Add daily briefing generation from actual DB records.
- [ ] Add integration test endpoint that reports missing env keys without exposing secrets.

### Task 3: Workspace App Shell And Client Data Layer

**Files:**
- Create: `lib/client/apiClient.ts`
- Create: `lib/client/useApi.ts`
- Create: `components/workspace/app/WorkspaceAppShell.tsx`
- Create: `components/workspace/app/WorkspaceDashboard.tsx`
- Create: `components/workspace/app/WorkspaceCrudPage.tsx`
- Create module-specific workspace components for messages, pricing, approvals, briefing, integrations, content, audit.
- Replace: `components/workspace/WorkspacePlaceholder.tsx`
- Add pages under `app/workspace/**/page.tsx`

- [ ] Implement authenticated app shell with toolbar, role display, language toggle, sign out, and sidebar links.
- [ ] Hide sidebar entries and buttons by role on the frontend while keeping backend enforcement.
- [ ] Make every sidebar item navigate to a real page.
- [ ] Add loading, error, empty, success, search, filters, forms, and refresh behavior.
- [ ] Add useful actions: create, edit, status change, assign, note, escalate, resolve, approve/reject, import/export, copy.

### Task 4: Content, Theme, Docs, And Verification

**Files:**
- Modify: `README.md`
- Modify content JSON as needed
- Modify CSS for workspace MVP utility classes

- [ ] Update README with run commands, SQLite fallback, PostgreSQL path, default accounts, CSV formats, permission matrix, and security notes.
- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run Prisma validate/generate/migrate/seed checks.
- [ ] Smoke test health, auth, dashboard, tasks, messages, orders, listings, pricing, approvals, inventory, briefings, integrations.

---

**Execution note:** The user explicitly asked not to stop for confirmation. Execute inline in this session and keep the plan updated through implementation.
