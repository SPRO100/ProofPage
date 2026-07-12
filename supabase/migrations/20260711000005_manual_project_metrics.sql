-- Manual, owner-entered project metrics. These rows are never verified.
CREATE TABLE project_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  metric_type text NOT NULL CHECK (metric_type IN ('users','customers','signups','sales','revenue','mrr','custom')),
  label_en text CHECK (label_en IS NULL OR length(label_en) <= 60),
  label_ru text CHECK (label_ru IS NULL OR length(label_ru) <= 60),
  value numeric(14,2) NOT NULL CHECK (value >= 0),
  unit text CHECK (unit IS NULL OR length(unit) <= 20),
  currency text CHECK (currency IS NULL OR currency ~ '^[A-Z]{3}$'),
  source_status text NOT NULL DEFAULT 'manual' CHECK (source_status IN ('manual','demo')),
  measured_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (metric_type <> 'custom' OR label_en IS NOT NULL OR label_ru IS NOT NULL),
  CHECK (metric_type NOT IN ('revenue','mrr') OR currency IS NOT NULL)
);

CREATE INDEX project_metrics_project_history_idx ON project_metrics (project_id, measured_at DESC);
ALTER TABLE project_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_metrics: public can view public project metrics"
  ON project_metrics FOR SELECT USING (EXISTS (
    SELECT 1 FROM projects pr JOIN profiles p ON p.id = pr.profile_id
    WHERE pr.id = project_id AND pr.is_public = true AND p.is_public = true
  ));
CREATE POLICY "project_metrics: owner can view"
  ON project_metrics FOR SELECT USING (EXISTS (
    SELECT 1 FROM projects pr WHERE pr.id = project_id AND pr.profile_id = auth.uid()
  ));
CREATE POLICY "project_metrics: owner can insert manual"
  ON project_metrics FOR INSERT WITH CHECK (source_status = 'manual' AND EXISTS (
    SELECT 1 FROM projects pr WHERE pr.id = project_id AND pr.profile_id = auth.uid()
  ));
CREATE POLICY "project_metrics: owner can update manual"
  ON project_metrics FOR UPDATE USING (source_status = 'manual' AND EXISTS (
    SELECT 1 FROM projects pr WHERE pr.id = project_id AND pr.profile_id = auth.uid()
  )) WITH CHECK (source_status = 'manual' AND EXISTS (
    SELECT 1 FROM projects pr WHERE pr.id = project_id AND pr.profile_id = auth.uid()
  ));
CREATE POLICY "project_metrics: owner can delete manual"
  ON project_metrics FOR DELETE USING (source_status = 'manual' AND EXISTS (
    SELECT 1 FROM projects pr WHERE pr.id = project_id AND pr.profile_id = auth.uid()
  ));
