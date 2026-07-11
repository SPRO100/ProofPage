# ProofPage — Roadmap

## Phase 0 — Foundation
- [x] Repository and Next.js application scaffold
- [x] Product and collaboration documentation
- [x] GitHub Actions CI (lint, typecheck, build)
- [x] Issue and PR templates
- [ ] `dev` branch protection and Vercel preview deployments

## Phase 1 — Documentation and architecture
**Owner: Claude + Codex** | Est. 2–3 days
- [x] PRODUCT.md — product definition
- [x] PRD.md — MVP feature requirements
- [x] ARCHITECTURE.md — technical design
- [x] DATABASE.md — Supabase schema and RLS
- [x] DESIGN.md — visual and UX rules
- [x] AGENTS.md — collaboration rules
- [x] tasks.json — task registry
- [ ] README.md — full setup guide

## Phase 2 — Technical foundation
**Owner: Claude (backend) + Codex (frontend)** | Est. 3–5 days
- [ ] Supabase project created and linked
- [ ] Database migrations (initial schema)
- [ ] Environment variables and `.env.example`
- [ ] Supabase Auth wired up
- [ ] RU/EN i18n dictionary and locale routing
- [ ] Route scaffold (all routes from PRD)
- [ ] shadcn/ui installed and configured
- [ ] Vercel project linked, preview and production deploys

## Phase 3 — Language selection
**Owner: Codex** | Est. 1 day
- [ ] Minimal language select screen (logo + EN | RU)
- [ ] Cookie persistence
- [ ] Language toggle in navigation
- [ ] Language passed to signup flow

## Phase 4 — Auth and onboarding
**Owner: Claude (backend) + Codex (UI)** | Est. 3–4 days
- [ ] Email/password registration and OAuth
- [ ] Username uniqueness check (server-side)
- [ ] Onboarding wizard (8 steps)
- [ ] Profile created on completion
- [ ] Free limits enforced from day 1

## Phase 5 — Public profile
**Owner: Codex (UI) + Claude (API)** | Est. 5–7 days
- [ ] Profile page `/[username]`
- [ ] Project cards with status badges
- [ ] Revenue display with verification state
- [ ] Bilingual content, mobile layout
- [ ] ProofPage branding on free

## Phase 6 — Plan limits
**Owner: Claude (backend) + Codex (UI)** | Est. 3–4 days
- [ ] Server-side entitlement checks
- [ ] Upgrade prompt on second project
- [ ] Pricing page and paywall components

## Phase 7 — Revenue verification
**Owner: Claude (backend) + Codex (UI)** | Est. 7–14 days
- [ ] Provider abstraction layer
- [ ] Stripe read-only integration
- [ ] Hourly sync cron job
- [ ] Verification badge logic
- [ ] ЮKassa integration (phase 7b)

## Phase 8 — Catalog and leaderboard
**Owner: Claude (queries) + Codex (UI)** | Est. 5–7 days
- [ ] Discover page with filters
- [ ] Leaderboard (Global + RU tabs)
- [ ] Daily snapshot job

## Phase 9 — Billing
**Owner: Claude (backend) + Codex (UI)** | Est. 5–10 days
- [ ] Stripe subscription checkout and webhooks
- [ ] ЮKassa billing (phase 9b)

## Phase 10 — Launch
**Owner: Both** | Est. 5–7 days
- [ ] QA, security review, performance audit
- [ ] Private alpha → public beta

## Work split
Claude: architecture, Supabase, auth, billing, revenue integrations.
Codex: bilingual UI, design system, public profile, QA. Tests and CI are shared.
