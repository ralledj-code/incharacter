import { createClient } from '@/lib/supabase/server'
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

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('dm_id', user.id)
    .eq('archived', false)
    .order('created_at', { ascending: false })

  const typedCampaigns = (campaigns || []) as Campaign[]
  const campaignIds = typedCampaigns.map(c => c.id)

  const { data: members } = campaignIds.length > 0
    ? await supabase
        .from('campaign_members')
        .select('campaign_id, player_id, accepted')
        .in('campaign_id', campaignIds)
    : { data: [] }

  const typedMembers = (members || []) as Array<{ campaign_id: string; player_id: string; accepted: boolean }>
  const playerIds = [...new Set(typedMembers.map(m => m.player_id))]

  // Fix 10: DMs get summary fields only — no API keys, no raw dossier text
  const { data: characters } = playerIds.length > 0
    ? await supabase
        .from('characters')
        .select('id, player_id, campaign_id, name, portrait_url, color_scheme, emotion_palette, tracker_config, created_at, updated_at')
        .in('player_id', playerIds)
    : { data: [] }

  const typedCharacters = (characters || []) as Character[]
  const characterIds = typedCharacters.map(c => c.id)

  const { data: trackers } = characterIds.length > 0
    ? await supabase
        .from('tracker_states')
        .select('*')
        .in('character_id', characterIds)
    : { data: [] }

  const { data: recentEvents } = characterIds.length > 0
    ? await supabase
        .from('events')
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
