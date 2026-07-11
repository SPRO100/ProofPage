# ProofPage — Database Schema

All tables live in Supabase (PostgreSQL). Row-Level Security is enabled on every table. Schema changes go through `supabase/migrations/` as timestamped SQL files — never edit the schema directly in the Supabase dashboard.

## Tables

### `profiles`
Extends `auth.users` 1:1. Created automatically after registration.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | = auth.users.id |
| username | text UNIQUE NOT NULL | 3–30 chars, lowercase alphanumeric + hyphens |
| display_name | text | |
| bio_en | text | English bio |
| bio_ru | text | Russian bio |
| avatar_url | text | Supabase Storage URL |
| location | text | |
| links | jsonb | `[{"label": string, "url": string}]` |
| theme_id | text FK → themes.id | DEFAULT `'base'` |
| plan | text | `'free'` \| `'pro'` — denormalised from subscriptions for fast reads |
| is_public | boolean | DEFAULT true |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

### `projects`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | DEFAULT gen_random_uuid() |
| profile_id | uuid FK → profiles.id ON DELETE CASCADE | |
| name | text NOT NULL | |
| description_en | text | |
| description_ru | text | |
| url | text | |
| logo_url | text | |
| status | text | `'active'` \| `'paused'` \| `'building'` \| `'sold'` \| `'closed'` |
| sort_order | int | position within a profile |
| is_public | boolean | DEFAULT true |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

### `revenue_sources`
One row per provider connection per project. Credentials stored via Supabase Vault.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| project_id | uuid FK → projects.id ON DELETE CASCADE | |
| provider | text | `'stripe'` \| `'yukassa'` |
| vault_secret_id | uuid | Reference to Supabase Vault secret |
| status | text | `'active'` \| `'error'` \| `'disconnected'` |
| last_synced_at | timestamptz | |
| error_message | text | |
| created_at | timestamptz | |

### `revenue_metrics`
Append-only time-series. Written only by the sync cron job (service role).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| project_id | uuid FK → projects.id ON DELETE CASCADE | |
| source_id | uuid FK → revenue_sources.id | NULL = manual entry |
| period_start | date | |
| period_end | date | |
| mrr | numeric(12,2) | |
| revenue_30d | numeric(12,2) | |
| revenue_total | numeric(12,2) | |
| currency | text | DEFAULT `'USD'` |
| is_verified | boolean | true only when source_id IS NOT NULL and source status = 'active' |
| recorded_at | timestamptz | DEFAULT now() |

### `subscriptions`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| profile_id | uuid FK → profiles.id ON DELETE CASCADE | |
| provider | text | `'stripe'` \| `'yukassa'` |
| provider_subscription_id | text | External ID from billing provider |
| status | text | `'active'` \| `'past_due'` \| `'canceled'` \| `'trialing'` |
| plan | text | `'pro'` |
| current_period_start | timestamptz | |
| current_period_end | timestamptz | |
| cancel_at_period_end | boolean | DEFAULT false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `themes`

| Column | Type | Notes |
|--------|------|-------|
| id | text PK | e.g. `'base'`, `'dark'`, `'minimal'` |
| name_en | text | |
| name_ru | text | |
| is_pro | boolean | |
| preview_url | text | |

### `profile_views`
Analytics — not exposed publicly.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| profile_id | uuid FK → profiles.id ON DELETE CASCADE | |
| viewed_at | timestamptz | DEFAULT now() |
| referrer | text | |
| country | text | |

### `project_clicks`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| project_id | uuid FK → projects.id ON DELETE CASCADE | |
| clicked_at | timestamptz | DEFAULT now() |
| target | text | `'url'` \| `'revenue'` |

## Row-Level Security

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | public rows (is_public) or owner | owner (trigger on auth.users) | owner | owner |
| projects | public rows (is_public) or owner | owner | owner | owner |
| revenue_sources | owner only | owner | service role (sync) | owner |
| revenue_metrics | owner; public sees only is_verified=true rows | service role | service role | service role |
| subscriptions | owner only | service role (webhook) | service role (webhook) | service role |
| themes | all | none | none | none |
| profile_views | owner (aggregate only) | anon + auth | none | none |
| project_clicks | owner (aggregate only) | anon + auth | none | none |

## Key indexes

```sql
CREATE INDEX ON projects (profile_id);
CREATE INDEX ON revenue_sources (project_id);
CREATE INDEX ON revenue_metrics (project_id, period_start DESC);
CREATE INDEX ON profile_views (profile_id, viewed_at DESC);
CREATE INDEX ON project_clicks (project_id, clicked_at DESC);
```

## Free plan constraint

Enforced at the application layer (Route Handler) and optionally as a DB trigger:

```sql
-- Application-level check in /api/projects POST:
-- SELECT count(*) FROM projects WHERE profile_id = $1
-- If count >= 1 AND profile.plan = 'free' → return 403
```
