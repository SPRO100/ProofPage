-- ProofPage: auto-create profile stub on new user registration
-- Migration: 20260711000003_auth_trigger
--
-- When Supabase Auth creates a new user, we insert a row into profiles
-- with a temporary username derived from the user's email.
-- The onboarding wizard then lets the user claim their real username.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER          -- runs as postgres, bypasses RLS
SET search_path = public
AS $$
DECLARE
  base_username text;
  final_username text;
  suffix        int := 0;
BEGIN
  -- Derive a safe username from email local part
  base_username := lower(regexp_replace(
    split_part(NEW.email, '@', 1),
    '[^a-z0-9-]', '-', 'g'
  ));
  -- Ensure minimum length
  IF length(base_username) < 3 THEN
    base_username := base_username || '-pp';
  END IF;
  -- Truncate to 28 chars so we have room for a 2-digit suffix
  base_username := left(base_username, 28);

  -- Find a unique username
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    suffix := suffix + 1;
    final_username := base_username || '-' || suffix;
  END LOOP;

  INSERT INTO profiles (id, username)
  VALUES (NEW.id, final_username);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
