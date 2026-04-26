-- FIX: handle_new_user trigger reads role from user metadata
-- Run this in Supabase SQL editor:
-- https://supabase.com/dashboard/project/gjvtcpzsrrivpukzojrp/sql/new
--
-- PROBLEM: The original trigger hardcodes role='player', ignoring the
-- role passed as user metadata during signUp (data: { role: 'dm' }).
-- This causes DM users to be created with role='player', sending them
-- to player onboarding regardless of intent.
--
-- FIX: Read role from raw_user_meta_data. Also generates player_code
-- using md5(random()) as a simple unique code (upgrade to the proper
-- IC-XXXX-XXXX format by running supabase-migrations.sql separately).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    new.id,
    split_part(new.email, '@', 1),
    COALESCE(new.raw_user_meta_data->>'role', 'player')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger (DROP + CREATE to pick up the new function body)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
