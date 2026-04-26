-- CASCADE DELETE MIGRATION
-- Drops all foreign keys referencing profiles(id) and re-adds with ON DELETE CASCADE.
-- Run in Supabase SQL editor:
-- https://supabase.com/dashboard/project/gjvtcpzsrrivpukzojrp/sql/new
--
-- This ensures that deleting a user from Supabase Auth UI (or via auth.admin.deleteUser)
-- automatically cascades and removes all related rows without manual cleanup.

-- ─── characters ─────────────────────────────────────────
ALTER TABLE characters DROP CONSTRAINT IF EXISTS characters_player_id_fkey;
ALTER TABLE characters ADD CONSTRAINT characters_player_id_fkey
  FOREIGN KEY (player_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- ─── campaigns ──────────────────────────────────────────
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_dm_id_fkey;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_dm_id_fkey
  FOREIGN KEY (dm_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- ─── campaign_members ───────────────────────────────────
ALTER TABLE campaign_members DROP CONSTRAINT IF EXISTS campaign_members_campaign_id_fkey;
ALTER TABLE campaign_members ADD CONSTRAINT campaign_members_campaign_id_fkey
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;

ALTER TABLE campaign_members DROP CONSTRAINT IF EXISTS campaign_members_player_id_fkey;
ALTER TABLE campaign_members ADD CONSTRAINT campaign_members_player_id_fkey
  FOREIGN KEY (player_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- ─── tracker_states ─────────────────────────────────────
ALTER TABLE tracker_states DROP CONSTRAINT IF EXISTS tracker_states_character_id_fkey;
ALTER TABLE tracker_states ADD CONSTRAINT tracker_states_character_id_fkey
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE;

-- ─── sessions ───────────────────────────────────────────
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_character_id_fkey;
ALTER TABLE sessions ADD CONSTRAINT sessions_character_id_fkey
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE;

-- ─── events ─────────────────────────────────────────────
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_session_id_fkey;
ALTER TABLE events ADD CONSTRAINT events_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_character_id_fkey;
ALTER TABLE events ADD CONSTRAINT events_character_id_fkey
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE;

-- ─── clues ──────────────────────────────────────────────
ALTER TABLE clues DROP CONSTRAINT IF EXISTS clues_character_id_fkey;
ALTER TABLE clues ADD CONSTRAINT clues_character_id_fkey
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE;

-- ─── relationships ──────────────────────────────────────
ALTER TABLE relationships DROP CONSTRAINT IF EXISTS relationships_character_id_fkey;
ALTER TABLE relationships ADD CONSTRAINT relationships_character_id_fkey
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE;

-- ─── session_replays ────────────────────────────────────
ALTER TABLE session_replays DROP CONSTRAINT IF EXISTS session_replays_session_id_fkey;
ALTER TABLE session_replays ADD CONSTRAINT session_replays_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;

-- ─── error_logs ─────────────────────────────────────────
ALTER TABLE error_logs DROP CONSTRAINT IF EXISTS error_logs_user_id_fkey;
ALTER TABLE error_logs ADD CONSTRAINT error_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE error_logs DROP CONSTRAINT IF EXISTS error_logs_character_id_fkey;
ALTER TABLE error_logs ADD CONSTRAINT error_logs_character_id_fkey
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE SET NULL;

-- ─── dm_session_notes ───────────────────────────────────
ALTER TABLE dm_session_notes DROP CONSTRAINT IF EXISTS dm_session_notes_campaign_id_fkey;
ALTER TABLE dm_session_notes ADD CONSTRAINT dm_session_notes_campaign_id_fkey
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;

ALTER TABLE dm_session_notes DROP CONSTRAINT IF EXISTS dm_session_notes_session_id_fkey;
ALTER TABLE dm_session_notes ADD CONSTRAINT dm_session_notes_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;

ALTER TABLE dm_session_notes DROP CONSTRAINT IF EXISTS dm_session_notes_dm_id_fkey;
ALTER TABLE dm_session_notes ADD CONSTRAINT dm_session_notes_dm_id_fkey
  FOREIGN KEY (dm_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- ─── deletion_log ───────────────────────────────────────
ALTER TABLE deletion_log DROP CONSTRAINT IF EXISTS deletion_log_deleted_by_fkey;
ALTER TABLE deletion_log ADD CONSTRAINT deletion_log_deleted_by_fkey
  FOREIGN KEY (deleted_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- ─── profiles → auth.users ──────────────────────────────
-- Supabase manages this constraint internally as profiles.id references auth.users.id.
-- To cascade profile deletion when an auth user is deleted, the trigger below is the
-- correct approach (Supabase doesn't expose the auth.users FK directly for alteration).

-- Ensure the trigger that creates profiles also handles cleanup:
CREATE OR REPLACE FUNCTION handle_user_delete()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_delete();

-- ─── Re-grant admin role after re-signup ─────────────────
-- Run after re-signing up with the admin email:
-- UPDATE profiles SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'ralledj@gmail.com');
