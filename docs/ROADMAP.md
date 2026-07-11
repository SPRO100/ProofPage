# ProofPage — Roadmap

## Phase 0 — Foundation
- [x] Repository and Next.js 16 application scaffold (PP-001)
- [x] AGENTS.md, CLAUDE.md, PRODUCT.md, ROADMAP.md
- [x] GitHub Actions CI (lint, typecheck, build)
- [x] Bilingual landing page and pricing (PP-002, in dev)
- [ ] Branch protection on `main` and `dev`
- [ ] Vercel project linked, preview deployments active

## Phase 1 — Documentation and architecture (PP-003)
**Owner: Claude** | Current task
- [x] ARCHITECTURE.md
- [x] DATABASE.md
- [x] DESIGN.md
- [x] PRD.md
- [x] tasks.json
- [x] GitHub Issue and PR templates
- [x] CI improvements
- [x] README.md setup guide
- [x] AGENTS.md expanded

## Phase 2 — Technical foundation
**Owner: Claude (backend) + Codex (frontend)**

- [ ] PP-004 — Supabase project setup, migrations (initial schema), seed data
- [ ] PP-005 — Supabase Auth integration, middleware, session helpers
- [ ] PP-006 — Environment variables, `.env.example`, Vercel deploy config
- [ ] PP-007 — RU/EN i18n dictionary and locale routing
- [ ] PP-008 — Route scaffold, shadcn/ui installation and theme

## Phase 3 — Auth and onboarding
**Owner: Claude (backend) + Codex (UI)**

- [ ] PP-009 — Email/password registration and OAuth (GitHub, Google)
- [ ] PP-010 — Username uniqueness check API
- [ ] PP-011 — Onboarding wizard UI (8 steps)
- [ ] PP-012 — Profile created on wizard completion

## Phase 4 — Public profile
**Owner: Codex (UI) + Claude (API)**

- [ ] PP-013 — Public profile API (`/api/profile/[username]`)
- [ ] PP-014 — Public profile page `/[username]` — desktop and mobile
- [ ] PP-015 — Verification badge component (all 4 states)
- [ ] PP-016 — Profile analytics (view tracking)

## Phase 5 — Plan limits
**Owner: Claude (backend) + Codex (UI)**

- [ ] PP-017 — Server-side entitlement middleware (project count, theme access)
- [ ] PP-018 — Pricing page, upgrade prompt, paywall components

## Phase 6 — Revenue verification
**Owner: Claude (backend) + Codex (UI)**

- [ ] PP-019 — `RevenueProvider` interface and sync infrastructure
- [ ] PP-020 — First provider integration (Stripe or ЮKassa — decision before starting)
- [ ] PP-021 — Revenue connection UI, sync status, charts
- [ ] PP-022 — Second provider (after first is validated in production)

## Phase 7 — Billing
**Owner: Claude (backend) + Codex (UI)**

- [ ] PP-023 — Subscription checkout (matching provider from Phase 6)
- [ ] PP-024 — Webhook handler (activate / renew / cancel / expire)
- [ ] PP-025 — Billing dashboard UI, subscription state management

## Phase 8 — Launch
**Owner: Both**

- [x] PP-026 — QA pass (all flows, both languages)
- [x] PP-027 — Security review and performance audit
- [x] PP-028 — Disable billing and revenue verification pending security audit
  - Billing (Stripe, ЮKassa, NOWPayments) disabled via `BILLING_ENABLED=false`
  - Revenue verification disabled via `REVENUE_VERIFICATION_ENABLED=false`
  - Pro plan not purchasable; existing Pro users in DB are unaffected
  - Cron schedule removed from vercel.json; endpoint guarded by flag
  - UI shows "Coming soon" placeholders on Revenue and Billing pages
  - Re-enable after security audit by setting flags to `true` in Vercel
- [ ] PP-029 — Private alpha (10–20 founders)
- [ ] PP-030 — Billing security audit and provider re-enable
- [ ] PP-031 — Bug fixes and public beta

## Work split summary
Claude: Supabase, auth, RLS, server enforcement, billing webhooks, revenue integrations.
Codex: bilingual UI, design system, public profile, onboarding, QA. Tests and CI are shared.
