# JPY Team Workspace

JPY Team Workspace is a usable MVP for the JPY three-person cross-border operations team. JPY is the team name only. It is not Japanese Yen and has no currency meaning in this product.

The public homepage stays as the Apple-style bilingual product entrance with 000-100 loading, language persistence, pointer background reaction, and team login. The internal `/workspace` area is now a database-backed MVP with real pages, APIs, role permissions, CSV import/export, activity timeline, audit logs, seed data, and mock team authentication.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS and project CSS layers
- Prisma 7
- PostgreSQL schema for deployment
- SQLite fallback for local machines where Docker virtualization is unavailable
- Zod validation
- bcryptjs password hashing
- httpOnly cookie sessions

## Install

```bash
npm install
copy .env.example .env
```

Real secrets must stay in `.env` on the server. Do not put API keys in client components, JSON content files, or localStorage.

## Local Database: SQLite Fallback

This machine currently cannot run Docker PostgreSQL because Docker Desktop reports virtualization support is not detected. Use SQLite locally:

```text
DATABASE_URL="file:./prisma/dev.db"
SQLITE_DATABASE_URL="file:./prisma/dev.db"
```

Then run:

```bash
npm run db:sqlite:generate
npm run db:sqlite:push
npm run db:sqlite:seed
```

`db:sqlite:push` keeps the local fallback database aligned with `prisma/schema.sqlite.prisma`. The seed creates the three users and demo records for every workspace module.

## PostgreSQL Path

When Docker/Desktop virtualization is available, switch to PostgreSQL:

```bash
docker compose up -d
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
```

Default local PostgreSQL URL:

```text
postgresql://jpy_user:jpy_password@localhost:5432/jpy_team_workspace?schema=public
```

## Run

```bash
npm run dev
```

Open:

- `http://127.0.0.1:3000/`
- `http://127.0.0.1:3000/workspace`

## Default Development Accounts

These are development accounts only. Change them before production.

| Person | Email | Password | Role |
| --- | --- | --- | --- |
| 负责人 | `owner@team.local` | `123456` | `OWNER` |
| 运营 | `operator@team.local` | `123456` | `OPERATOR` |
| 客服与发货 | `support@team.local` | `123456` | `SUPPORT` |

Passwords are hashed in the database. The browser stores only the language preference in localStorage. Session state is stored server-side and sent through an httpOnly cookie.

## Workspace Pages

- `/workspace`: dashboard overview
- `/workspace/tasks`: task center
- `/workspace/messages`: customer messages and templates
- `/workspace/orders`: orders, risk status, CSV import/export
- `/workspace/listings`: listing pipeline, CSV import/export
- `/workspace/pricing`: pricing calculation and approval flow
- `/workspace/approvals`: owner approval queue
- `/workspace/inventory`: inventory alerts, CSV import/export
- `/workspace/briefing`: daily plan/review generation
- `/workspace/integrations`: reserved connection states and env checks
- `/workspace/settings/content`: owner-only content/theme JSON editor
- `/workspace/audit`: owner-only audit log

## Core API Surface

Auth and system:

- `GET /api/health`
- `GET /api/version`
- `GET /api/users`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

Workspace:

- `GET /api/dashboard/summary`
- `GET|POST|PATCH|DELETE /api/tasks`
- `GET|POST /api/messages`
- `GET|PATCH /api/messages/[id]`
- `POST /api/messages/[id]/note`
- `POST /api/messages/[id]/escalate`
- `POST /api/messages/[id]/resolve`
- `GET|POST /api/message-templates`
- `GET|POST|PATCH|DELETE /api/orders`
- `POST /api/orders/[id]/note`
- `POST /api/orders/[id]/create-task`
- `POST /api/orders/import`
- `GET /api/orders/export`
- `GET|POST /api/listings`
- `GET|PATCH /api/listings/[id]`
- `POST /api/listings/[id]/create-task`
- `POST /api/listings/[id]/create-pricing`
- `POST /api/listings/import`
- `GET /api/listings/export`
- `GET|POST /api/pricing-rules`
- `GET|PATCH /api/pricing/[id]`
- `POST /api/pricing/[id]/submit`
- `POST /api/pricing/[id]/approve`
- `POST /api/pricing/[id]/reject`
- `GET|POST /api/approvals`
- `GET /api/approvals/[id]`
- `POST /api/approvals/[id]/approve`
- `POST /api/approvals/[id]/reject`
- `GET|POST /api/inventory`
- `PATCH /api/inventory/[id]`
- `POST /api/inventory/[id]/create-task`
- `POST /api/inventory/import`
- `GET /api/inventory/export`
- `GET|POST /api/activities`
- `GET /api/activities/recent`
- `GET /api/briefings`
- `POST /api/briefings/generate`
- `GET|PATCH /api/briefings/[id]`
- `GET /api/connections`
- `POST|PATCH /api/connections`
- `PATCH /api/connections/[id]`
- `POST /api/integrations/[provider]/test`
- `GET /api/audit`
- `GET|POST /api/content`
- `GET|PUT /api/content/site`
- `GET|PUT /api/content/workspace`
- `GET|PUT /api/content/theme`

Response shape:

```json
{ "success": true, "data": {}, "message": "OK" }
```

```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Message" } }
```

## CSV Formats

Orders import:

```csv
externalOrderId,customerName,totalAmount,estimatedProfit,skuCount,status,riskLevel,platform
SO-1001,Amy,19.9,4.5,1,PENDING_SHIPMENT,LOW,SHOPEE
```

Listings import:

```csv
sku,title,cost,targetPrice,status,platform
SKU-001,Portable Organizer,5.2,12.9,IDEA,SHOPEE
```

Inventory import:

```csv
sku,productName,available,incoming,safetyStock,note
SKU-001,Portable Organizer,18,40,20,Restock this week
```

Exports return CSV directly from:

- `/api/orders/export`
- `/api/listings/export`
- `/api/inventory/export`

## Permission Matrix

| Capability | OWNER | OPERATOR | SUPPORT |
| --- | --- | --- | --- |
| Dashboard | yes | yes | yes |
| Tasks | manage | manage | manage own scoped work |
| Messages | manage | manage | manage |
| Orders | manage | manage | manage |
| Listings | manage | manage | hidden/forbidden |
| Inventory | manage | manage | hidden/forbidden |
| Pricing | approve/manage | create/submit | hidden/forbidden |
| Approvals | approve/reject | view/create | view/create |
| Briefings | manage | manage | manage |
| Integrations | manage/test | view | view |
| Content/theme | manage | forbidden | forbidden |
| Audit log | view | forbidden | forbidden |

Frontend navigation hides owner/operator-only sections where appropriate, but backend route guards remain the authority.

## Editable Content And Theme

Copy and visual configuration live in:

- `content/site.zh.json`
- `content/site.en.json`
- `content/workspace.zh.json`
- `content/workspace.en.json`
- `content/theme.json`

The content APIs write versioned records into `ContentVersion`. Reads prefer the latest database version and fall back to local JSON if no version exists.

## Integrations

Reserved integration boundaries exist for Shopee, TikTok Shop, Miaoshou ERP, AI, exchange rate, payment, logistics, and tax. They only check `process.env` and return safe configuration status. They do not call external services yet and do not expose secret values.

## Verify

```bash
npm run db:sqlite:generate
npm run db:sqlite:push
npm run db:sqlite:seed
npx prisma validate
npx prisma validate --config prisma.sqlite.config.ts
npm test
npm run lint
npm run build
```

Recommended smoke checks after `npm run dev`:

- Open `/`, confirm the public JPY homepage loads.
- Sign in with `owner@team.local / 123456`.
- Open each workspace route listed above.
- Create a task.
- Import and export one orders CSV.
- Create, submit, and approve one pricing rule.
- Generate a briefing.
- Confirm `support@team.local` cannot access pricing APIs.

## Security Notes

- This is an MVP with mock local team accounts, not production auth.
- No session token is stored in localStorage.
- Session cookie is httpOnly, sameSite=lax, and secure in production.
- Session token hashes are stored in the database.
- Passwords are hashed with bcryptjs.
- API routes use Zod validation and role guards.
- Sensitive metadata keys such as password, token, secret, key, authorization, and cookie are filtered from audit logs.
- Payment and tax are placeholders only. The system does not handle real bank cards and does not automate tax filing.

## Current Non-Goals

Not implemented yet:

- Real Shopee API integration
- Real TikTok Shop API integration
- Real Miaoshou ERP integration
- Real payment, logistics, exchange-rate, AI, or tax integrations
- Password reset
- OAuth
- Production user management UI
- Real marketplace synchronization
- Production deployment hardening
