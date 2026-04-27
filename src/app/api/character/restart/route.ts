import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = await createServiceClient()
    const db = (t: string) => (service.from(t) as AnyRec)

    // FIX 1: Keep the character row — only clear gameplay history
    // Find the player's character (keep dossier_text, tracker_config, api_key_encrypted, etc.)
    const { data: characterRows } = await db('characters')
      .select('id, name, tracker_config')
      .eq('player_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    const character = characterRows?.[0]
    if (!character) {
      return NextResponse.json({ error: 'No character found' }, { status: 404 })
    }
    const charId = (character as AnyRec).id

    // Delete all gameplay history
    const { data: sessions } = await db('sessions').select('id').eq('character_id', charId)
    const sessionIds = ((sessions || []) as AnyRec[]).map(s => s.id)
    if (sessionIds.length > 0) {
      await db('events').delete().in('session_id', sessionIds)
      await db('session_replays').delete().in('session_id', sessionIds)
    }
    await db('sessions').delete().eq('character_id', charId)
    await db('clues').delete().eq('character_id', charId)
    await db('relationships').delete().eq('character_id', charId)

    // Reset tracker_states to onboarding initial values
    // Read initial values from tracker_config if stored, else use standard defaults
    const config = (character as AnyRec).tracker_config as AnyRec | null
    const initMask   = config?.initial_trackers?.mask   ?? 50
    const initDagger = config?.initial_trackers?.dagger ?? 30
    const initBottle = config?.initial_trackers?.bottle ?? 40
    const initWound  = config?.initial_trackers?.wound  ?? 60

    // Delete existing tracker states and create fresh one
    await db('tracker_states').delete().eq('character_id', charId)
    await db('tracker_states').insert({
      character_id: charId,
      mask:   initMask,
      dagger: initDagger,
      bottle: initBottle,
      wound:  initWound,
      play_directive: null, // will be regenerated on next visit to Now screen
      glyph_states: config?.emotionPalette || null,
    })

    // Create fresh session 1
    await db('sessions').insert({
      character_id: charId,
      session_number: 1,
    })

    // Log the restart
    await db('deletion_log').insert({
      deleted_by: user.id,
      target_type: 'character_restart',
      target_id: charId,
      reason: 'player_self_restart',
    }).catch(() => {}) // non-fatal

    return NextResponse.json({
      ok: true,
      characterName: (character as AnyRec).name,
      message: 'Gameplay history cleared. Dossier and configuration kept.',
    })
  } catch (error) {
    console.error('[character/restart]', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
