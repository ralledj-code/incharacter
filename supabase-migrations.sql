-- Run these in the Supabase SQL editor at:
-- https://supabase.com/dashboard/project/gjvtcpzsrrivpukzojrp/sql/new

-- ─── Fix 2: Player codes ───
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS player_code text unique;

CREATE OR REPLACE FUNCTION generate_player_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := 'IC-';
  i integer;
BEGIN
  FOR i IN 1..4 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  result := result || '-';
  FOR i IN 1..4 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION assign_player_code()
RETURNS trigger AS $$
DECLARE
  new_code text;
  attempts integer := 0;
BEGIN
  IF NEW.player_code IS NULL THEN
    LOOP
      new_code := generate_player_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE player_code = new_code);
      attempts := attempts + 1;
      IF attempts > 100 THEN RAISE EXCEPTION 'Could not generate unique player code'; END IF;
    END LOOP;
    NEW.player_code := new_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_player_code ON profiles;
CREATE TRIGGER set_player_code
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION assign_player_code();

-- Backfill existing profiles without a code
UPDATE profiles SET player_code = generate_player_code()
WHERE player_code IS NULL;

-- ─── Fix 2: Campaign codes ───
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS campaign_code text unique;

CREATE OR REPLACE FUNCTION generate_campaign_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := 'CAMP-';
  i integer;
BEGIN
  FOR i IN 1..4 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  result := result || '-';
  FOR i IN 1..4 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION assign_campaign_code()
RETURNS trigger AS $$
DECLARE
  new_code text;
  attempts integer := 0;
BEGIN
  IF NEW.campaign_code IS NULL THEN
    LOOP
      new_code := generate_campaign_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM campaigns WHERE campaign_code = new_code);
      attempts := attempts + 1;
      IF attempts > 100 THEN RAISE EXCEPTION 'Could not generate unique campaign code'; END IF;
    END LOOP;
    NEW.campaign_code := new_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_campaign_code ON campaigns;
CREATE TRIGGER set_campaign_code
  BEFORE INSERT ON campaigns
  FOR EACH ROW EXECUTE FUNCTION assign_campaign_code();

UPDATE campaigns SET campaign_code = generate_campaign_code()
WHERE campaign_code IS NULL;

-- ─── Fix 9: DM session notes ───
CREATE TABLE IF NOT EXISTS dm_session_notes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  session_id uuid references sessions(id) on delete cascade,
  dm_id uuid references profiles(id) on delete cascade,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

ALTER TABLE dm_session_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dm_notes_own" ON dm_session_notes;
CREATE POLICY "dm_notes_own" ON dm_session_notes
  FOR ALL USING (
    dm_id = auth.uid() AND
    campaign_id IN (SELECT id FROM campaigns WHERE dm_id = auth.uid())
  );

-- ─── Fix 16: Deletion log ───
CREATE TABLE IF NOT EXISTS deletion_log (
  id uuid primary key default gen_random_uuid(),
  deleted_by uuid references profiles(id) on delete set null,
  target_type text,
  target_id uuid,
  target_email text,
  reason text,
  deleted_at timestamp with time zone default now()
);

ALTER TABLE deletion_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deletion_log_admin" ON deletion_log;
CREATE POLICY "deletion_log_admin" ON deletion_log
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

DROP POLICY IF EXISTS "deletion_log_insert" ON deletion_log;
CREATE POLICY "deletion_log_insert" ON deletion_log
  FOR INSERT WITH CHECK (deleted_by = auth.uid());
