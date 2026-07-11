-- ProofPage: Row-Level Security policies
-- Migration: 20260711000002_rls_policies
--
-- Principle: RLS is the authoritative enforcement layer.
-- Application-level checks are a UX convenience, not the security boundary.

-- ─────────────────────────────────────────────
-- Enable RLS on all user tables
-- ─────────────────────────────────────────────
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_sources  ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_metrics  ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views    ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_clicks   ENABLE ROW LEVEL SECURITY;

-- themes has no RLS — it is public reference data, SELECT only.

-- ─────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────

-- Public visitors see profiles where is_public = true
CREATE POLICY "profiles: public can view public profiles"
  ON profiles FOR SELECT
  USING (is_public = true);

-- Owners see their own profile regardless of is_public
CREATE POLICY "profiles: owner can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Owners update their own profile
CREATE POLICY "profiles: owner can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Owners delete their own profile (cascades to projects etc.)
CREATE POLICY "profiles: owner can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- INSERT is handled by the handle_new_user trigger (service role);
-- direct INSERT from auth users is not allowed.

-- ─────────────────────────────────────────────
-- projects
-- ─────────────────────────────────────────────

CREATE POLICY "projects: public can view public projects"
  ON projects FOR SELECT
  USING (
    is_public = true AND
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id AND p.is_public = true
    )
  );

CREATE POLICY "projects: owner can view own projects"
  ON projects FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.id = auth.uid())
  );

CREATE POLICY "projects: owner can insert"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.id = auth.uid())
  );

CREATE POLICY "projects: owner can update"
  ON projects FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.id = auth.uid())
  );

CREATE POLICY "projects: owner can delete"
  ON projects FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- revenue_sources  (owner only — credentials are sensitive)
-- ─────────────────────────────────────────────

CREATE POLICY "revenue_sources: owner can select"
  ON revenue_sources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects pr
      JOIN profiles p ON p.id = pr.profile_id
      WHERE pr.id = project_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "revenue_sources: owner can insert"
  ON revenue_sources FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects pr
      JOIN profiles p ON p.id = pr.profile_id
      WHERE pr.id = project_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "revenue_sources: owner can update"
  ON revenue_sources FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects pr
      JOIN profiles p ON p.id = pr.profile_id
      WHERE pr.id = project_id AND p.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects pr
      JOIN profiles p ON p.id = pr.profile_id
      WHERE pr.id = project_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "revenue_sources: owner can delete"
  ON revenue_sources FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects pr
      JOIN profiles p ON p.id = pr.profile_id
      WHERE pr.id = project_id AND p.id = auth.uid()
    )
  );

-- Sync cron runs as service role — it bypasses RLS entirely.

-- ─────────────────────────────────────────────
-- revenue_metrics
-- ─────────────────────────────────────────────

-- Verified metrics are public (show on public profile)
CREATE POLICY "revenue_metrics: public can view verified"
  ON revenue_metrics FOR SELECT
  USING (
    is_verified = true AND
    EXISTS (
      SELECT 1 FROM projects pr
      JOIN profiles p ON p.id = pr.profile_id
      WHERE pr.id = project_id AND p.is_public = true AND pr.is_public = true
    )
  );

-- Owners see all their own metrics (including unverified)
CREATE POLICY "revenue_metrics: owner can view all"
  ON revenue_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects pr
      JOIN profiles p ON p.id = pr.profile_id
      WHERE pr.id = project_id AND p.id = auth.uid()
    )
  );

-- INSERT/UPDATE/DELETE only by service role (sync cron + webhook).
-- No direct-user policies — service role bypasses RLS.

-- ─────────────────────────────────────────────
-- subscriptions  (owner + service role only)
-- ─────────────────────────────────────────────

CREATE POLICY "subscriptions: owner can view own"
  ON subscriptions FOR SELECT
  USING (auth.uid() = profile_id);

-- INSERT/UPDATE/DELETE only by service role (billing webhook handler).

-- ─────────────────────────────────────────────
-- profile_views  (analytics)
-- ─────────────────────────────────────────────

-- Anyone can insert a view (anonymous analytics)
CREATE POLICY "profile_views: anyone can insert"
  ON profile_views FOR INSERT
  WITH CHECK (true);

-- Owners read their own aggregate stats
CREATE POLICY "profile_views: owner can select"
  ON profile_views FOR SELECT
  USING (auth.uid() = profile_id);

-- ─────────────────────────────────────────────
-- project_clicks  (analytics)
-- ─────────────────────────────────────────────

CREATE POLICY "project_clicks: anyone can insert"
  ON project_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "project_clicks: owner can select"
  ON project_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects pr
      JOIN profiles p ON p.id = pr.profile_id
      WHERE pr.id = project_id AND p.id = auth.uid()
    )
  );
