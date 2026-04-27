import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PlayerDesktop from '@/components/PlayerDesktop'
import NowScreen from '@/components/NowScreen'
import type { Character, TrackerState, Session, Event, Clue, Relationship } from '@/types/database'

export default async function NowPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const charCol = 'id, player_id, campaign_id, name, dossier_text, color_scheme, emotion_palette, tracker_config, portrait_url, created_at, updated_at'

  const { data: character } = await supabase
    .from('characters').select(charCol)
    .eq('player_id', user.id).order('created_at', { ascending: false }).limit(1).single()

  if (!character) redirect('/onboarding?role=player')
  const charId = (character as Character).id

  const [
    { data: tracker },
    { data: session },
    { data: recentEvents },
    { data: sessionEvents },
    { data: clues },
    { data: relationships },
    { data: allSessions },
  ] = await Promise.all([
    supabase.from('tracker_states').select('*').eq('character_id', charId)
      .order('updated_at', { ascending: false }).limit(1).single(),
    supabase.from('sessions').select('*').eq('character_id', charId)
      .is('ended_at', null).order('started_at', { ascending: false }).limit(1).single(),
    supabase.from('events').select('narrative, category, reaction').eq('character_id', charId)
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('events').select('*').eq('character_id', charId)
      .order('created_at', { ascending: true }),
    supabase.from('clues').select('*').eq('character_id', charId)
      .order('created_at', { ascending: false }),
    supabase.from('relationships').select('*').eq('character_id', charId)
      .order('created_at', { ascending: false }),
    supabase.from('sessions').select('id, session_number, started_at, waking_text').eq('character_id', charId)
      .order('session_number', { ascending: false }).limit(10),
  ])

  const props = {
    character: character as Character,
    tracker: tracker as TrackerState | null,
    session: session as Session | null,
    recentEvents: (recentEvents || []) as Array<{ narrative: string | null; category: string; reaction: string }>,
    sessionEvents: (sessionEvents || []) as Event[],
    clues: (clues || []) as Clue[],
    relationships: (relationships || []) as Relationship[],
    allSessions: (allSessions || []) as Array<{ id: string; session_number: number; started_at: string; waking_text: string | null }>,
  }

  return (
    <>
      {/* Desktop: two-panel layout (hidden on mobile) */}
      <div className="hidden md:block">
        <PlayerDesktop {...props} />
      </div>
      {/* Mobile: single Now screen (hidden on desktop) */}
      <div className="block md:hidden">
        <NowScreen
          character={props.character}
          tracker={props.tracker}
          session={props.session}
          recentEvents={props.recentEvents}
        />
      </div>
    </>
  )
}
