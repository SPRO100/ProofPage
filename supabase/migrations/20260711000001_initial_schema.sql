-- ProofPage: initial schema
-- Migration: 20260711000001_initial_schema
--
-- Creates all tables, constraints, and indexes.
-- RLS policies are in 20260711000002_rls_policies.sql
-- Seed data is in seed.sql

-- ─────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- themes (reference data, no RLS needed for SELECT)
-- ─────────────────────────────────────────────
CREATE TABLE themes (
  id         text PRIMARY KEY,
  name_en    text NOT NULL,
  name_ru    text NOT NULL,
  is_pro     boolean NOT NULL DEFAULT false,
  preview_url text
);

INSERT INTO themes (id, name_en, name_ru, is_pro) VALUES
  ('base',    'Base',    'Базовая',      false),
  ('dark',    'Dark',    'Тёмная',       true),
  ('minimal', 'Minimal', 'Минималистик', true);

-- ─────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────
CREATE TABLE profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     text UNIQUE NOT NULL
                 CHECK (
                   length(username) BETWEEN 3 AND 30 AND
                   username ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'
                 ),
  display_name text,
  bio_en       text,
  bio_ru       text,
  avatar_url   text,
  location     text,
  links        jsonb NOT NULL DEFAULT '[]'::jsonb,
  theme_id     text NOT NULL DEFAULT 'base' REFERENCES themes(id),
  plan         text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  is_public    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON profiles (username);
CREATE INDEX ON profiles (plan);

-- ─────────────────────────────────────────────
-- projects
-- ─────────────────────────────────────────────
CREATE TABLE projects (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name           text NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
  description_en text,
  description_ru text,
  url            text,
  logo_url       text,
  status         text NOT NULL DEFAULT 'building'
                   CHECK (status IN ('active', 'paused', 'building', 'sold', 'closed')),
  sort_order     int NOT NULL DEFAULT 0,
  is_public      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON projects (profile_id);
CREATE INDEX ON projects (profile_id, sort_order);

-- ─────────────────────────────────────────────
-- revenue_sources
-- ─────────────────────────────────────────────
CREATE TABLE revenue_sources (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  provider        text NOT NULL CHECK (provider IN ('stripe', 'yukassa')),
  vault_secret_id uuid,                    -- references Supabase Vault secret
  status          text NOT NULL DEFAULT 'disconnected'
                    CHECK (status IN ('active', 'error', 'disconnected')),
  last_synced_at  timestamptz,
  error_message   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, provider)            -- one connection per provider per project
);

CREATE INDEX ON revenue_sources (project_id);
CREATE INDEX ON revenue_sources (status);

-- ─────────────────────────────────────────────
-- revenue_metrics (append-only time-series)
-- ─────────────────────────────────────────────
CREATE TABLE revenue_metrics (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source_id      uuid REFERENCES revenue_sources(id) ON DELETE SET NULL,
  period_start   date NOT NULL,
  period_end     date NOT NULL CHECK (period_end >= period_start),
  mrr            numeric(12, 2) NOT NULL DEFAULT 0 CHECK (mrr >= 0),
  revenue_30d    numeric(12, 2) NOT NULL DEFAULT 0 CHECK (revenue_30d >= 0),
  revenue_total  numeric(12, 2) NOT NULL DEFAULT 0 CHECK (revenue_total >= 0),
  currency       text NOT NULL DEFAULT 'USD',
  is_verified    boolean NOT NULL DEFAULT false,
  recorded_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON revenue_metrics (project_id, period_start DESC);
CREATE INDEX ON revenue_metrics (source_id);

-- ─────────────────────────────────────────────
-- subscriptions
-- ─────────────────────────────────────────────
CREATE TABLE subscriptions (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id               uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider                 text NOT NULL CHECK (provider IN ('stripe', 'yukassa')),
  provider_subscription_id text NOT NULL,
  status                   text NOT NULL
                             CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  plan                     text NOT NULL DEFAULT 'pro',
  current_period_start     timestamptz NOT NULL,
  current_period_end       timestamptz NOT NULL,
  cancel_at_period_end     boolean NOT NULL DEFAULT false,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_subscription_id)
);

CREATE INDEX ON subscriptions (profile_id);
CREATE INDEX ON subscriptions (status);

-- ─────────────────────────────────────────────
-- profile_views (analytics, append-only)
-- ─────────────────────────────────────────────
CREATE TABLE profile_views (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at  timestamptz NOT NULL DEFAULT now(),
  referrer   text,
  country    text
);

CREATE INDEX ON profile_views (profile_id, viewed_at DESC);

-- ─────────────────────────────────────────────
-- project_clicks (analytics, append-only)
-- ─────────────────────────────────────────────
CREATE TABLE project_clicks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  clicked_at timestamptz NOT NULL DEFAULT now(),
  target     text NOT NULL CHECK (target IN ('url', 'revenue'))
);

CREATE INDEX ON project_clicks (project_id, clicked_at DESC);

-- ─────────────────────────────────────────────
-- updated_at trigger
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
