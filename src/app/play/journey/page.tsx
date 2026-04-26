import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import JourneyScreen from '@/components/JourneyScreen'
import type { Character, Session, Clue, Relationship, TrackerState } from '@/types/database'

export default async function JourneyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('player_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!character) redirect('/onboarding?role=player')

  const charId = (character as Character).id

  const [{ data: sessions }, { data: clues }, { data: relationships }, { data: tracker }] = await Promise.all([
    supabase.from('sessions').select('*, events(*)').eq('character_id', charId).order('session_number', { ascending: false }),
    supabase.from('clues').select('*').eq('character_id', charId).order('created_at', { ascending: false }),
    supabase.from('relationships').select('*').eq('character_id', charId).order('created_at', { ascending: false }),
    supabase.from('tracker_states').select('*').eq('character_id', charId).order('updated_at', { ascending: false }).limit(1).single(),
  ])

  return (
    <JourneyScreen
      character={character as Character}
      sessions={(sessions || []) as (Session & { events: unknown[] })[]}
      clues={(clues || []) as Clue[]}
      relationships={(relationships || []) as Relationship[]}
      tracker={tracker as TrackerState | null}
    />
  )
}
