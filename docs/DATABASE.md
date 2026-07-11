# ProofPage — Database Schema

All tables live in Supabase (PostgreSQL). Row-Level Security is enabled on every table.

## Tables

### `profiles`
Extends Supabase `auth.users` 1:1.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | = auth.users.id |
| username | text UNIQUE NOT NULL | URL slug, 3–30 chars, lowercase alphanumeric + hyphens |
| display_name | text | |
| bio_en | text | English bio |
| bio_ru | text | Russian bio |
| avatar_url | text | Supabase Storage URL |
| location | text | |
| links | jsonb | `[{label, url}]` |
| theme_id | text | FK → themes.id |
| plan | text | `free` \| `pro`, denormalised from subscriptions |
| is_public | boolean DEFAULT true | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `projects`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| profile_id | uuid FK → profiles.id | |
| name | text NOT NULL | |
| description_en | text | |
| description_ru | text | |
| url | text | |
| logo_url | text | |
| status | text | `active` \| `paused` \| `building` \| `sold` \| `closed` |
| category_id | uuid FK → categories.id | |
| sort_order | int | within a profile |
| is_public | boolean DEFAULT true | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `revenue_sources`
One row per provider connection per project.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| project_id | uuid FK → projects.id | |
| provider | text | `stripe` \| `yukassa` \| `telegram_stars` |
| credentials_enc | text | Encrypted with Supabase Vault |
| status | text | `active` \| `error` \| `disconnected` |
| last_synced_at | timestamptz | |
| error_message | text | |
| created_at | timestamptz | |

### `revenue_metrics`
Append-only time-series snapshots per project.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| project_id | uuid FK → projects.id | |
| source_id | uuid FK → revenue_sources.id | nullable (null = manual) |
| period_start | date | |
| period_end | date | |
| mrr | numeric(12,2) | Monthly Recurring Revenue |
| revenue_30d | numeric(12,2) | |
| revenue_total | numeric(12,2) | |
| currency | text DEFAULT 'USD' | |
| is_verified | boolean | true only when source_id is not null and source is active |
| recorded_at | timestamptz | |

### `verification_statuses`
Computed view, not a table. Derived from `revenue_sources` + `revenue_metrics`.

### `subscriptions`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| profile_id | uuid FK → profiles.id | |
| provider | text | `stripe` \| `yukassa` |
| provider_subscription_id | text | External ID |
| status | text | `active` \| `past_due` \| `canceled` \| `trialing` |
| plan | text | `pro` |
| current_period_start | timestamptz | |
| current_period_end | timestamptz | |
| cancel_at_period_end | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `themes`
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | e.g. `base`, `dark`, `minimal` |
| name_en | text | |
| name_ru | text | |
| is_pro | boolean | |
| preview_url | text | |

### `categories`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| slug | text UNIQUE | |
| name_en | text | |
| name_ru | text | |
| sort_order | int | |

### `profile_views`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| profile_id | uuid FK → profiles.id | |
| viewed_at | timestamptz | |
| referrer | text | |
| country | text | |

### `project_clicks`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| project_id | uuid FK → projects.id | |
| clicked_at | timestamptz | |
| target | text | `url` \| `revenue` |

### `leaderboard_snapshots`
Pre-computed daily snapshots for fast leaderboard reads.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| project_id | uuid FK → projects.id | |
| snapshot_date | date | |
| market | text | `global` \| `ru` |
| mrr | numeric(12,2) | |
| revenue_30d | numeric(12,2) | |
| revenue_total | numeric(12,2) | |
| growth_30d | numeric(6,4) | ratio |
| rank_mrr | int | |
| rank_30d | int | |
| rank_total | int | |
| rank_growth | int | |

## Row-Level Security rules

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | public (is_public=true) or owner | owner | owner | owner |
| projects | public (is_public=true) or owner | owner | owner | owner |
| revenue_sources | owner only | owner | owner | owner |
| revenue_metrics | owner or public (is_verified=true) | service role | service role | service role |
| subscriptions | owner only | service role | service role | service role |
| themes | public | none | none | none |
| categories | public | none | none | none |
| profile_views | owner (aggregate) | anon + auth | none | none |
| project_clicks | owner (aggregate) | anon + auth | none | none |
| leaderboard_snapshots | public | service role | service role | service role |

## Indexes

```sql
CREATE INDEX ON projects (profile_id);
CREATE INDEX ON revenue_sources (project_id);
CREATE INDEX ON revenue_metrics (project_id, period_start DESC);
CREATE INDEX ON profile_views (profile_id, viewed_at DESC);
CREATE INDEX ON leaderboard_snapshots (snapshot_date DESC, market, rank_mrr);
```

## Migrations

All schema changes go through `supabase/migrations/` as timestamped SQL files. Never edit the schema directly in the Supabase dashboard.
