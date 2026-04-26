import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NowScreen from '@/components/NowScreen'
import type { Character, TrackerState, Session } from '@/types/database'

export default async function NowPage() {
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

  const { data: tracker } = await supabase
    .from('tracker_states')
    .select('*')
    .eq('character_id', (character as Character).id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('character_id', (character as Character).id)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  const { data: recentEvents } = await supabase
    .from('events')
    .select('narrative, category, reaction')
    .eq('character_id', (character as Character).id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <NowScreen
      character={character as Character}
      tracker={tracker as TrackerState | null}
      session={session as Session | null}
      recentEvents={(recentEvents || []) as Array<{ narrative: string | null; category: string; reaction: string }>}
    />
  )
}
