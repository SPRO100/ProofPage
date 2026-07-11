-- ProofPage: development seed data
-- Run after all migrations have been applied.
-- Uses service role (bypasses RLS).
-- DO NOT run in production.

-- ─────────────────────────────────────────────
-- Demo founder: free plan
-- ─────────────────────────────────────────────
-- In a real Supabase project you would create the auth.users row
-- via the dashboard or CLI. Here we insert directly for local dev.

INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at,
  aud, role
) VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'demo-free@proofpage.test',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email"}'::jsonb,
  now(), now(),
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Profile is auto-created by the trigger, but we update it here
-- to set realistic data.
UPDATE profiles SET
  username     = 'alex',
  display_name = 'Alex Morgan',
  bio_en       = 'Independent founder building useful software.',
  bio_ru       = 'Независимый основатель, создающий полезные продукты.',
  location     = 'Tallinn, Estonia',
  links        = '[
    {"label": "Twitter", "url": "https://twitter.com/alexmorgan"},
    {"label": "GitHub",  "url": "https://github.com/alexmorgan"}
  ]'::jsonb,
  theme_id     = 'base',
  plan         = 'free',
  is_public    = true
WHERE id = 'aaaaaaaa-0000-0000-0000-000000000001';

-- One project (free limit)
INSERT INTO projects (
  id, profile_id, name, description_en, description_ru,
  url, status, sort_order, is_public
) VALUES (
  'bbbbbbbb-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'SignalDesk',
  'Customer feedback without the noise.',
  'Обратная связь от клиентов без лишнего шума.',
  'https://signaldesk.example.com',
  'active',
  0,
  true
) ON CONFLICT (id) DO NOTHING;

-- Manual (unverified) revenue entry
INSERT INTO revenue_metrics (
  project_id, source_id,
  period_start, period_end,
  mrr, revenue_30d, revenue_total,
  currency, is_verified
) VALUES (
  'bbbbbbbb-0000-0000-0000-000000000001',
  NULL,           -- no source = manual
  date_trunc('month', now())::date,
  (date_trunc('month', now()) + interval '1 month - 1 day')::date,
  1200.00,        -- MRR
  1100.00,        -- 30-day revenue
  4800.00,        -- all-time total
  'USD',
  false           -- manual → never verified
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- Demo founder: pro plan
-- ─────────────────────────────────────────────
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at,
  aud, role
) VALUES (
  'aaaaaaaa-0000-0000-0000-000000000002',
  'demo-pro@proofpage.test',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email"}'::jsonb,
  now(), now(),
  'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

UPDATE profiles SET
  username     = 'priya',
  display_name = 'Priya Nair',
  bio_en       = 'Solo founder. Building in public.',
  bio_ru       = 'Соло-основатель. Строю на виду.',
  location     = 'Bangalore, India',
  links        = '[{"label":"Twitter","url":"https://twitter.com/priyanair"}]'::jsonb,
  theme_id     = 'dark',
  plan         = 'pro',
  is_public    = true
WHERE id = 'aaaaaaaa-0000-0000-0000-000000000002';

INSERT INTO projects (id, profile_id, name, description_en, description_ru, url, status, sort_order, is_public) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002',
   'TinyMetrics', 'Simple analytics for small teams.', 'Простая аналитика для небольших команд.',
   'https://tinymetrics.example.com', 'active', 0, true),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002',
   'MailBridge',  'Transactional email without the complexity.', 'Транзакционная почта без сложностей.',
   'https://mailbridge.example.com', 'paused', 1, true)
ON CONFLICT (id) DO NOTHING;

-- Pro plan subscription
INSERT INTO subscriptions (
  profile_id, provider, provider_subscription_id,
  status, plan,
  current_period_start, current_period_end,
  cancel_at_period_end
) VALUES (
  'aaaaaaaa-0000-0000-0000-000000000002',
  'stripe', 'sub_demo_priya',
  'active', 'pro',
  date_trunc('month', now()),
  date_trunc('month', now()) + interval '1 month',
  false
) ON CONFLICT DO NOTHING;

-- Revenue source connected (Stripe)
INSERT INTO revenue_sources (
  id, project_id, provider, vault_secret_id,
  status, last_synced_at
) VALUES (
  'cccccccc-0000-0000-0000-000000000001',
  'bbbbbbbb-0000-0000-0000-000000000002',
  'stripe', NULL,   -- vault_secret_id not applicable in seed
  'active', now() - interval '30 minutes'
) ON CONFLICT DO NOTHING;

-- Verified revenue metrics
INSERT INTO revenue_metrics (
  project_id, source_id,
  period_start, period_end,
  mrr, revenue_30d, revenue_total,
  currency, is_verified
) VALUES (
  'bbbbbbbb-0000-0000-0000-000000000002',
  'cccccccc-0000-0000-0000-000000000001',
  date_trunc('month', now())::date,
  (date_trunc('month', now()) + interval '1 month - 1 day')::date,
  7200.00,
  7100.00,
  28400.00,
  'USD',
  true    -- connected source → verified
) ON CONFLICT DO NOTHING;
