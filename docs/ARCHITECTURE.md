# ProofPage — Architecture

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router), TypeScript | 16.2.10 |
| Styling | Tailwind CSS, shadcn/ui | 4.x |
| Backend | Next.js Route Handlers | — |
| Database | Supabase (PostgreSQL + RLS) | — |
| Auth | Supabase Auth (email/password + OAuth) | — |
| Storage | Supabase Storage (avatars) | — |
| Hosting | Vercel (preview per PR, production on `main`) | — |
| CI | GitHub Actions | — |
| Payments | Stripe or ЮKassa (one provider for MVP) | — |

## Directory structure

```
/
├── src/
│   ├── app/                    — Next.js App Router
│   │   ├── (auth)/             — /login, /signup, /onboarding
│   │   ├── (dashboard)/        — /dashboard/**
│   │   ├── (public)/           — /[username]
│   │   ├── api/                — Route Handlers (Claude owns)
│   │   ├── layout.tsx
│   │   ├── page.tsx            — Landing + language selector
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 — shadcn/ui primitives (Codex owns)
│   │   └── ...                 — Domain components (Codex owns)
│   ├── lib/
│   │   ├── supabase/           — Browser, server, admin clients (Claude)
│   │   ├── auth/               — Auth helpers, middleware (Claude)
│   │   ├── revenue/            — Provider abstraction layer (Claude)
│   │   ├── billing/            — Subscription helpers (Claude)
│   │   └── i18n/               — RU/EN dictionary and utilities (Codex)
│   ├── types/                  — Shared TypeScript types (shared)
│   └── middleware.ts            — Auth guard + locale redirect
├── supabase/
│   ├── migrations/             — Versioned SQL (Claude owns)
│   └── seed.sql                — Dev seed data
└── docs/                       — Project documentation (shared)
```

## Auth flow

1. User registers via Supabase Auth (email or OAuth).
2. `middleware.ts` checks session on every request to `/dashboard/*`.
3. Supabase RLS enforces data ownership at the database layer — this is the authoritative guard.
4. Server components use the Supabase server client; client components use the anon browser client.

## Revenue provider abstraction

All providers implement one common interface:

```typescript
interface RevenueProvider {
  readonly id: string
  connect(projectId: string, credentials: unknown): Promise<void>
  sync(projectId: string): Promise<RevenueSnapshot>
  disconnect(projectId: string): Promise<void>
}

interface RevenueSnapshot {
  mrr: number
  revenue30d: number
  revenueTotal: number
  currency: string
  periodStart: Date
  periodEnd: Date
}
```

MVP ships with **one** provider. The second provider is added in a separate task after the first is validated in production.

Credentials are stored encrypted via Supabase Vault — never in plain columns.

## Sync mechanism

A Vercel Cron job (`/api/cron/sync-revenue`) runs every hour:
1. Fetches all `revenue_sources` with `status = 'active'`.
2. Calls `provider.sync(projectId)` for each.
3. Writes a new row to `revenue_metrics`.
4. Updates `revenue_sources.last_synced_at` and `status`.

On failure, `status` is set to `'error'` and `error_message` is populated. The public badge reflects this automatically.

## Subscription enforcement

Entitlement checks happen server-side in Route Handlers and Server Components. Client UI reflects state but is never the source of truth. A billing webhook updates `subscriptions.status` and is the only place plan changes take effect.

## Caching strategy

| Data | Strategy |
|------|---------|
| Public profile | ISR, `revalidate: 60` |
| Dashboard data | No cache (always fresh) |
| Revenue metrics | Stored in DB; Next.js layer does not cache |
| Landing page | Static |
