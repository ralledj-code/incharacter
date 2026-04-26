import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = await createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (t: string) => (service.from(t) as any)

    // Find all characters for this player
    const { data: characters } = await db('characters').select('id').eq('player_id', user.id)
    const charIds = (characters || []).map((c: { id: string }) => c.id)

    if (charIds.length > 0) {
      // Cascade: delete all related data explicitly (in case FK cascade not yet run)
      for (const id of charIds) {
        const { data: sessions } = await db('sessions').select('id').eq('character_id', id)
        const sessionIds = (sessions || []).map((s: { id: string }) => s.id)
        if (sessionIds.length > 0) {
          await db('events').delete().in('session_id', sessionIds)
          await db('session_replays').delete().in('session_id', sessionIds)
        }
        await db('sessions').delete().eq('character_id', id)
        await db('tracker_states').delete().eq('character_id', id)
        await db('clues').delete().eq('character_id', id)
        await db('relationships').delete().eq('character_id', id)
      }
      await db('characters').delete().eq('player_id', user.id)
    }

    // Log the restart
    await db('deletion_log').insert({
      deleted_by: user.id,
      target_type: 'character_restart',
      target_id: user.id,
      reason: 'player_self_restart',
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
