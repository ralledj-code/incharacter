import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: character } = await (supabase.from('characters') as any)
    .select('id').eq('player_id', user.id)
    .order('created_at', { ascending: false }).limit(1).single()

  if (!character) return NextResponse.json({ events: [] })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: events } = await (supabase.from('events') as any)
    .select('id, category, subcategory, reaction, narrative, created_at')
    .eq('character_id', (character as { id: string }).id)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json({ events: events || [] })
}
