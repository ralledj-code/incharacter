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

  // Fetch character without api_key_encrypted — only fetch presence flag
  const { data: characterRaw } = await db('characters')
    .select('id, player_id, name, dossier_text, color_scheme, tracker_config, api_key_encrypted')
    .eq('player_id', user.id)
    .order('created_at', { ascending: false }).limit(1).single()

  // Strip the encrypted key — client only needs to know if one is set
  const character = characterRaw
    ? {
        id: (characterRaw as { id: string }).id,
        name: (characterRaw as { name: string }).name,
        dossier_text: (characterRaw as { dossier_text?: string }).dossier_text,
        color_scheme: (characterRaw as { color_scheme?: unknown }).color_scheme,
        hasApiKey: !!(characterRaw as { api_key_encrypted?: string }).api_key_encrypted,
      }
    : null

  let tracker = null
  if (character) {
    const { data: t } = await db('tracker_states').select('*')
      .eq('character_id', character.id)
      .order('updated_at', { ascending: false }).limit(1).single()
    tracker = t
  }

  return (
    <SettingsClient
      profile={profile}
      character={character}
      tracker={tracker}
      email={user.email || ''}
    />
  )
}
