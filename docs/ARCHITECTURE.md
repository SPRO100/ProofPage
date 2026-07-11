# ProofPage — Architecture

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js Route Handlers (API routes) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email/password + OAuth) |
| Storage | Supabase Storage (avatars, assets) |
| Hosting | Vercel (preview per PR, production on main) |
| CI | GitHub Actions (lint, typecheck, build) |
| Payments | Stripe (international), ЮKassa (RU) |

## Directory structure

```
/
├── src/
│   ├── app/                  — Next.js App Router pages and layouts
│   │   ├── (auth)/           — Login, signup, onboarding
│   │   ├── (dashboard)/      — Authenticated founder area
│   │   ├── (public)/         — Public profile, discover, leaderboard
│   │   └── api/              — Route handlers
│   ├── components/           — Shared UI components
│   │   ├── ui/               — shadcn/ui primitives
│   │   └── ...               — Domain components
│   ├── lib/
│   │   ├── supabase/         — Client, server, and admin Supabase clients
│   │   ├── auth/             — Auth helpers and middleware
│   │   ├── revenue/          — Provider abstraction layer
│   │   ├── billing/          — Stripe and ЮKassa helpers
│   │   └── i18n/             — RU/EN dictionary and locale utilities
│   ├── types/                — Shared TypeScript types
│   └── middleware.ts          — Auth guard and locale redirect
├── supabase/
│   ├── migrations/           — Versioned SQL migrations
│   └── seed.sql              — Development seed data
└── docs/                     — Project documentation
```

## Auth flow

1. User registers via Supabase Auth (email or OAuth).
2. `middleware.ts` checks session on every request to `/dashboard/*`.
3. Supabase RLS enforces data ownership at the database layer.
4. Server components use the Supabase server client; client components use the browser client.

## Revenue provider abstraction

All providers implement a common interface:

```typescript
interface RevenueProvider {
  id: string
  connect(credentials: unknown): Promise<void>
  sync(projectId: string): Promise<RevenueSnapshot>
  disconnect(projectId: string): Promise<void>
}
```

A cron job (Vercel Cron or Supabase pg_cron) calls `sync` every hour for active connections and updates `revenue_metrics` and `revenue_sources.last_synced_at`.

## Subscription enforcement

Entitlement checks happen server-side in Route Handlers and Server Components. Client UI reflects the state but is never the source of truth. A Stripe/ЮKassa webhook updates `subscriptions.status` and triggers re-evaluation of feature flags.

## Caching strategy

- Public profiles: `cache: 'force-cache'` with 60-second revalidation via `next.revalidate`
- Leaderboard: ISR, revalidated every 5 minutes
- Dashboard data: no caching (always fresh)
- Revenue metrics: cached in DB, not in Next.js layer
