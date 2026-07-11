# ProofPage — Product Requirements Document (MVP)

## Goals

1. A founder can create a public proof page in under 5 minutes.
2. A visitor can see whether a project's revenue is verified or manual.
3. Pro subscribers can connect a revenue provider and display live verified numbers.

## Users

| Role | Description |
|------|-------------|
| Founder (free) | One public page, one project, manual revenue |
| Founder (pro) | Multiple projects, verified revenue, analytics |
| Visitor | Reads a public profile, no account required |

## Routes

```
/                        — Landing page (bilingual, language selector)
/login                   — Sign in
/signup                  — Register
/onboarding              — Post-signup setup wizard
/dashboard               — Founder home
/dashboard/profile       — Edit profile
/dashboard/projects      — Manage projects
/dashboard/revenue       — Connect and sync revenue providers (Pro)
/dashboard/billing       — Subscription management
/[username]              — Public profile page
```

## Onboarding flow

1. Language selection (first visit only, persisted in localStorage)
2. Email / OAuth registration
3. Choose unique username (`proofpage.io/username`)
4. Display name and avatar
5. Short bio (EN + RU)
6. Social links
7. Add first project
8. Publish page

## Project statuses

`Active` · `Paused` · `Building` · `Sold` · `Closed`

## Free plan enforcement (server-side)

- Second project blocked at the API level; client shows upgrade prompt
- Manual revenue always marked Unverified regardless of plan
- Revenue connections require Pro — enforced in Route Handlers
- Additional themes require Pro — enforced server-side

## Revenue verification states

| State | Condition |
|-------|-----------|
| Verified | Active provider connection, last sync within 24 h |
| Stale | Last sync older than 24 h |
| Error | Connection failed |
| Unverified | Manual entry or no connection |

## Revenue providers

**Phase 1 (MVP):** One provider — decision between Stripe and ЮKassa is made before PP-007 starts.

**Phase 2:** Second provider added after the first integration is validated in production.

A common `RevenueProvider` interface is implemented first; providers are plugged in one at a time.

## What is NOT in MVP

- Catalog or discover page
- Leaderboard (global or RU)
- Revenue rankings
- Background ranking jobs
- Public API
- Custom domain (infrastructure prepared, UI deferred)
- Marketplace
