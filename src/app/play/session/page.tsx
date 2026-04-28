import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SessionScreen from '@/components/SessionScreen'
import type { Character, Session, Event, TrackerState } from '@/types/database'

export default async function SessionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: character } = await supabase
    .from('characters')
    .select('id, player_id, campaign_id, name, dossier_text, color_scheme, emotion_palette, tracker_config, portrait_url, created_at, updated_at')
    .eq('player_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!character) redirect('/onboarding?role=player')

  const charId = (character as Character).id

  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('character_id', charId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('session_id', (session as Session | null)?.id || '')
    .order('created_at', { ascending: false })

  const { data: tracker } = await supabase
    .from('tracker_states')
    .select('*')
    .eq('character_id', charId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <SessionScreen
      character={character as Character}
      session={session as Session | null}
      events={(events || []) as Event[]}
      tracker={tracker as TrackerState | null}
    />
  )
}
