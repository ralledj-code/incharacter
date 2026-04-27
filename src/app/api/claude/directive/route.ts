import { NextRequest, NextResponse } from 'next/server'
import { generatePlayDirective } from '@/lib/api'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedApiKey } from '@/lib/getApiKey'
import { createClient as rawClient } from '@supabase/supabase-js'

const admin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function clamp(v: number) { return Math.max(0, Math.min(100, v)) }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const apiKey = body.characterId
      ? await getDecryptedApiKey(user.id, body.characterId)
      : undefined

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type AnyRec = Record<string, any>

    // Fetch previous event from DB for context
    let previousEvent: { category: string; subcategory: string; reaction: string } | undefined
    if (body.characterId && !body.previousEvent) {
      const { data: events } = await (admin.from('events') as AnyRec)
        .select('category, subcategory, reaction')
        .eq('character_id', body.characterId)
        .order('created_at', { ascending: false })
        .limit(2)
      // [0] is the just-saved current event, [1] is the previous one
      if (events?.[1]) previousEvent = events[1]
      else if (events?.[0] && !body.currentEvent) previousEvent = events[0]
    }

    // Fetch current glyph_states from tracker_states
    let currentGlyphStates: Record<string, number> = {}
    if (body.characterId) {
      const { data: ts } = await (admin.from('tracker_states') as AnyRec)
        .select('glyph_states')
        .eq('character_id', body.characterId)
        .single()
      if (ts?.glyph_states && typeof ts.glyph_states === 'object') {
        currentGlyphStates = ts.glyph_states as Record<string, number>
      } else if (body.emotionPalette?.length) {
        // Initialize from base values if no glyph_states yet
        for (const s of body.emotionPalette) {
          currentGlyphStates[s.id] = s.base_value ?? 40
        }
      }
    }

    const result = await generatePlayDirective({
      characterName: body.characterName,
      dossierSummary: body.dossierSummary || '',
      trackers: body.trackers,
      recentEvents: body.recentEvents,
      trackerNames: body.trackerNames,
      dominantState: body.dominantState,
      previousDirective: body.previousDirective,
      currentEvent: body.currentEvent,
      previousEvent: body.previousEvent || previousEvent,
      emotionPalette: body.emotionPalette,
      apiKey: apiKey ?? undefined,
      userId: user.id,
      characterId: body.characterId,
    })

    console.log('[directive] result:', JSON.stringify({ directive: result.directive, stateChanges: result.stateChanges }))

    // Apply state_changes to glyph_states
    const newGlyphStates = { ...currentGlyphStates }
    for (const [stateId, delta] of Object.entries(result.stateChanges)) {
      const current = newGlyphStates[stateId] ?? 40
      newGlyphStates[stateId] = clamp(current + delta)
    }

    if (body.characterId) {
      // Save play_directive + glyph_states to tracker_states
      const { error: tsErr } = await (admin.from('tracker_states') as AnyRec)
        .update({ play_directive: result.directive, glyph_states: newGlyphStates, updated_at: new Date().toISOString() })
        .eq('character_id', body.characterId)
      if (tsErr) console.log('[directive] tracker_states write error:', tsErr.message)

      // Save play_directive + dm_read to characters (triggers DM realtime)
      const { error: charErr } = await (admin.from('characters') as AnyRec)
        .update({ play_directive: result.directive, dm_read: result.dmRead, updated_at: new Date().toISOString() })
        .eq('id', body.characterId)
      if (charErr) console.log('[directive] characters write error:', charErr.message)
    }

    return NextResponse.json({
      directive: result.directive,
      dmRead: result.dmRead,
      stateChanges: result.stateChanges,
      glyphStates: newGlyphStates,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
