# ProofPage — Product Requirements Document (MVP)

## Goals

1. A founder can create a public proof page in under 5 minutes.
2. A visitor can verify that a project's revenue is real.
3. Pro subscribers can connect a revenue provider and display live verified numbers.

## Users

| Role | Description |
|------|-------------|
| Founder (free) | One public page, one project, manual revenue |
| Founder (pro) | Multiple projects, verified revenue, analytics |
| Visitor | Reads a public profile, no account required |

## Routes

```
/                        — Landing page
/login                   — Sign in
/signup                  — Register
/onboarding              — Post-signup setup wizard
/dashboard               — Founder home
/dashboard/profile       — Edit profile
/dashboard/projects      — Manage projects
/dashboard/revenue       — Connect and sync revenue providers
/dashboard/billing       — Subscription management
/[username]              — Public profile
/discover                — Catalog (Pro content)
/leaderboard             — Revenue leaderboard (Pro)
```

## Onboarding flow

1. Language selection
2. Email / OAuth registration
3. Choose unique username (`proofpage.io/username`)
4. Name and avatar
5. Short bio
6. Social links
7. Add first project
8. Publish page

## Project statuses

`Active` · `Paused` · `Building` · `Sold` · `Closed`

## Free limits enforcement

- Second project blocked server-side; client shows upgrade prompt
- Manual revenue always marked Unverified regardless of plan
- Leaderboard and catalog require Pro
- Custom domain requires Pro

## Revenue verification states

| State | Condition |
|-------|-----------|
| Verified | Active provider connection, last sync < 24 h |
| Stale | Last sync > 24 h |
| Error | Connection failed |
| Unverified | Manual entry or no connection |

## Revenue providers (priority order)

1. Stripe (international)
2. ЮKassa (Russia)
3. Telegram Stars (later)

## Leaderboard rules

- Pro projects with verified revenue only
- Separate tabs: Global · RU
- Metrics: MRR · 30-day revenue · total revenue · growth
- Manual figures do not appear in leaderboard rankings
