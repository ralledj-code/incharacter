import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: character } = await (supabase.from('characters') as any)
    .select('id, name, tracker_config, emotion_palette, color_scheme, campaign_id, created_at, updated_at')
    .eq('player_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!character) return NextResponse.json({ error: 'No character' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tracker } = await (supabase.from('tracker_states') as any)
    .select('state_values, play_directive')
    .eq('character_id', (character as { id: string }).id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json({
    ...(character as object),
    play_directive: (tracker as { play_directive?: string } | null)?.play_directive || null,
    stateValues: tracker ? (tracker as { state_values: Record<string, number> }).state_values : null,
  })
}
