import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DMDashboard from '@/components/DMDashboard'
import type { Campaign, Character, TrackerState } from '@/types/database'

export default async function DMDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?role=dm')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profileData = profile as { role: string | null } | null
  if (profileData?.role !== 'dm' && profileData?.role !== 'admin') {
    redirect('/play/now')
  }

  // FIX 2: Use service role for all DM dashboard queries to bypass RLS
  const service = await createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sdb = (t: string) => (service.from(t) as any)

  const { data: campaigns } = await sdb('campaigns')
    .select('*')
    .eq('dm_id', user.id)
    .eq('archived', false)
    .order('created_at', { ascending: false })

  const typedCampaigns = (campaigns || []) as Campaign[]
  const campaignIds = typedCampaigns.map((c: Campaign) => c.id)

  console.log('[dm/dashboard] DM:', user.id, 'campaigns:', campaignIds.length)

  // Primary: characters with campaign_id IN dm's campaigns (works regardless of campaign_members RLS)
  const { data: charactersByCampaign } = campaignIds.length > 0
    ? await sdb('characters')
        .select('id, player_id, campaign_id, name, portrait_url, color_scheme, emotion_palette, tracker_config, created_at, updated_at')
        .in('campaign_id', campaignIds)
    : { data: [] }

  console.log('[dm/dashboard] characters by campaign_id:', (charactersByCampaign || []).length)

  // Secondary: via campaign_members table (service role bypasses RLS)
  const { data: members } = campaignIds.length > 0
    ? await sdb('campaign_members')
        .select('campaign_id, player_id, accepted')
        .in('campaign_id', campaignIds)
    : { data: [] }

  const typedMembers = (members || []) as Array<{ campaign_id: string; player_id: string; accepted: boolean }>
  const memberPlayerIds = [...new Set(typedMembers.map((m: { player_id: string }) => m.player_id))]

  console.log('[dm/dashboard] members:', typedMembers.length, 'player IDs:', memberPlayerIds.length)

  // Merge: characters from both sources
  const charsByCampaignMap = new Map(
    ((charactersByCampaign || []) as Character[]).map(c => [c.id, c])
  )
  const campaignCharPlayerIds = ((charactersByCampaign || []) as Character[]).map(c => c.player_id)
  const allPlayerIds = [...new Set([...memberPlayerIds, ...campaignCharPlayerIds])]

  const { data: charactersByPlayer } = allPlayerIds.length > 0
    ? await sdb('characters')
        .select('id, player_id, campaign_id, name, portrait_url, color_scheme, emotion_palette, tracker_config, created_at, updated_at')
        .in('player_id', allPlayerIds)
    : { data: [] }

  const allCharsMap = new Map<string, Character>()
  ;((charactersByPlayer || []) as Character[]).forEach(c => allCharsMap.set(c.id, c))
  charsByCampaignMap.forEach((c, id) => { if (!allCharsMap.has(id)) allCharsMap.set(id, c) })
  const characters = [...allCharsMap.values()]

  console.log('[dm/dashboard] total characters found:', characters.length)

  const typedCharacters = characters as Character[]
  const characterIds = typedCharacters.map(c => c.id)

  const { data: trackers } = characterIds.length > 0
    ? await sdb('tracker_states')
        .select('*')
        .in('character_id', characterIds)
    : { data: [] }

  const { data: recentEvents } = characterIds.length > 0
    ? await sdb('events')
        .select('character_id, category, reaction, created_at')
        .in('character_id', characterIds)
        .order('created_at', { ascending: false })
        .limit(50)
    : { data: [] }

  return (
    <DMDashboard
      campaigns={typedCampaigns}
      members={typedMembers}
      characters={typedCharacters}
      trackers={(trackers || []) as TrackerState[]}
      recentEvents={(recentEvents || []) as Array<{ character_id: string; category: string; reaction: string; created_at: string }>}
    />
  )
}
