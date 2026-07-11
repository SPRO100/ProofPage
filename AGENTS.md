# ProofPage — Collaboration Rules

Read this file before starting any task.

## General rules

- ProofPage is a standalone product. Do not add ProofMRR dependencies, shared databases, or any architectural coupling to ProofMRR.
- Read `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, and `docs/ROADMAP.md` before making changes.
- Every user-facing string requires both English and Russian variants — no exceptions.
- Free plan limits (one project, base theme) are enforced server-side. Never rely on client-side checks alone.
- Manual revenue is always unverified regardless of plan.
- Revenue provider integrations are read-only. Never write to a provider.
- Never commit secrets, tokens, or credentials of any kind.
- Before opening a PR: run `npm run lint && npm run typecheck && npm run build`.

## Branch naming

| Agent | Pattern | Example |
|-------|---------|---------|
| Claude | `claude/PP-###-short-description` | `claude/PP-005-supabase-schema` |
| Codex | `codex/PP-###-short-description` | `codex/PP-004-auth-onboarding-ui` |

## Workflow

1. Pick a GitHub Issue and move it to **In Progress** on the project board.
2. Create a branch from `dev`.
3. Do only the work described in the issue — no scope creep.
4. Open a PR into `dev` with the issue linked (`Closes #NNN`).
5. The other agent reviews the PR.
6. CI must pass before merge.
7. Merge into `dev`; verify on Vercel Preview.

## Work split

| Area | Claude | Codex |
|------|--------|-------|
| Architecture | Owner | Review |
| Supabase schema and SQL | Owner | Tests |
| Database migrations and RLS | Owner | — |
| Auth and session | Owner | UI + flows |
| Server-side plan enforcement | Owner | — |
| Subscription and webhooks | Owner | UI + QA |
| Revenue provider integrations | Owner | UI + QA |
| Design system | Review | Owner |
| Public profile UI | API only | Owner |
| Onboarding UI | API only | Owner |
| RU/EN i18n | Server support | Owner |
| Automated tests | Shared | Shared |
| Code review | Cross | Cross |
| Documentation | Architecture | Product + updates |

## File ownership (do not edit without coordination)

- **Claude owns**: `supabase/`, `src/lib/supabase/`, `src/lib/auth/`, `src/lib/revenue/`, `src/lib/billing/`, `src/app/api/`
- **Codex owns**: `src/components/`, `src/app/(auth)/`, `src/app/(public)/`, `src/lib/i18n/`
- **Shared**: `src/app/(dashboard)/`, `src/types/`, `docs/`
