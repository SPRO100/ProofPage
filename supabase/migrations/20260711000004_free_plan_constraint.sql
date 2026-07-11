-- ProofPage: enforce free plan project limit at the database level
-- Migration: 20260711000004_free_plan_constraint
--
-- This is a defence-in-depth guard. The Route Handler checks first
-- and returns a user-friendly error. This trigger is the hard stop.

CREATE OR REPLACE FUNCTION enforce_free_project_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  owner_plan text;
  project_count int;
BEGIN
  SELECT plan INTO owner_plan
  FROM profiles
  WHERE id = NEW.profile_id;

  IF owner_plan = 'free' THEN
    SELECT count(*) INTO project_count
    FROM projects
    WHERE profile_id = NEW.profile_id;

    IF project_count >= 1 THEN
      RAISE EXCEPTION 'Free plan allows only one project. Upgrade to Pro to add more.'
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER check_free_project_limit
  BEFORE INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION enforce_free_project_limit();
