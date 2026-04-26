-- FIX: Infinite recursion in campaigns / campaign_members RLS policies
-- Run this in Supabase SQL editor:
-- https://supabase.com/dashboard/project/gjvtcpzsrrivpukzojrp/sql/new
--
-- ROOT CAUSE:
--   campaigns_member_read: queries campaign_members to check membership
--   campaign_members_dm:   queries campaigns to check DM ownership
--   These two policies create a mutual circular dependency. Any query
--   that hits either policy triggers the other, which triggers the first.
--
-- FIX: Use SECURITY DEFINER helper functions. These run with elevated
-- privileges and bypass RLS on the target table, breaking the cycle.

-- ─── Helper functions (bypass RLS via SECURITY DEFINER) ────────────
CREATE OR REPLACE FUNCTION get_dm_campaign_ids()
RETURNS SETOF uuid
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT id FROM public.campaigns WHERE dm_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION get_member_campaign_ids()
RETURNS SETOF uuid
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT campaign_id FROM public.campaign_members WHERE player_id = auth.uid()
$$;

-- ─── Drop the circular policies ────────────────────────────────────
DROP POLICY IF EXISTS "campaigns_member_read" ON public.campaigns;
DROP POLICY IF EXISTS "campaign_members_dm" ON public.campaign_members;

-- ─── Recreate without circular references ──────────────────────────
-- Players can read campaigns they're members of (uses SECURITY DEFINER fn)
CREATE POLICY "campaigns_member_read" ON public.campaigns
  FOR SELECT USING (
    id IN (SELECT get_member_campaign_ids())
  );

-- DMs can fully manage campaign_members for their own campaigns (uses SECURITY DEFINER fn)
CREATE POLICY "campaign_members_dm" ON public.campaign_members
  FOR ALL USING (
    campaign_id IN (SELECT get_dm_campaign_ids())
  );
