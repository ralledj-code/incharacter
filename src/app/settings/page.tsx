import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from '@/components/SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (t: string) => (supabase.from(t) as any)

  const { data: profile } = await db('profiles').select('*').eq('id', user.id).single()
  const role = (profile as { role?: string } | null)?.role || 'player'

  let character = null
  let campaign = null
  let playerCampaign: { id: string; name: string; campaign_code?: string } | null = null

  if (role === 'dm') {
    const { data: campaignRaw } = await db('campaigns')
      .select('id, name, campaign_code, dm_api_key_encrypted')
      .eq('dm_id', user.id).eq('archived', false)
      .order('created_at', { ascending: false }).limit(1).single()
    if (campaignRaw) {
      campaign = {
        id: (campaignRaw as { id: string }).id,
        name: (campaignRaw as { name: string }).name,
        campaign_code: (campaignRaw as { campaign_code?: string }).campaign_code,
        hasDmApiKey: !!(campaignRaw as { dm_api_key_encrypted?: string }).dm_api_key_encrypted,
      }
    }
  } else {
    const { data: characterRaw } = await db('characters')
      .select('id, player_id, name, dossier_text, color_scheme, tracker_config, api_key_encrypted, campaign_id')
      .eq('player_id', user.id)
      .order('created_at', { ascending: false }).limit(1).single()

    character = characterRaw
      ? {
          id: (characterRaw as { id: string }).id,
          name: (characterRaw as { name: string }).name,
          dossier_text: (characterRaw as { dossier_text?: string }).dossier_text,
          color_scheme: (characterRaw as { color_scheme?: unknown }).color_scheme,
          hasApiKey: !!(characterRaw as { api_key_encrypted?: string }).api_key_encrypted,
          campaign_id: (characterRaw as { campaign_id?: string }).campaign_id,
        }
      : null

    // Fetch player's current campaign if they're in one
    const campaignId = (character as { campaign_id?: string } | null)?.campaign_id
    if (campaignId) {
      const { data: campRaw } = await db('campaigns')
        .select('id, name, campaign_code').eq('id', campaignId).single()
      if (campRaw) playerCampaign = campRaw as { id: string; name: string; campaign_code?: string }
    }
  }

  return (
    <SettingsClient
      profile={profile}
      character={character}
      campaign={campaign}
      playerCampaign={playerCampaign}
      email={user.email || ''}
    />
  )
}
