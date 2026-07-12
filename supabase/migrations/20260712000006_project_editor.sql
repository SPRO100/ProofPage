-- Project publishing controls and public logo storage.
ALTER TABLE projects
  ADD COLUMN primary_metric_type text NOT NULL DEFAULT 'users'
  CHECK (primary_metric_type IN ('users','customers','signups','sales','revenue','mrr','custom'));

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('project-logos', 'project-logos', true, 2097152, ARRAY['image/png','image/jpeg','image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "project logos: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-logos');

CREATE POLICY "project logos: owner insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "project logos: owner update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'project-logos' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'project-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "project logos: owner delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'project-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
