import { NextRequest, NextResponse } from 'next/server'
import { generateEventNarrative } from '@/lib/api'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedApiKey } from '@/lib/getApiKey'
import { createClient as rawClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

const admin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.characterId || !body.category || !body.reaction) {
      return NextResponse.json({ error: 'Missing characterId, category, or reaction' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const apiKey = await getDecryptedApiKey(user.id, body.characterId)

    // Fetch character to get tracker_config (palette + weights) server-side
    const { data: character } = await (admin.from('characters') as AnyRec)
      .select('dossier_text, tracker_config, tracker_states(state_values)')
      .eq('id', body.characterId)
      .single()

    const palette = character?.tracker_config?.emotion_palette ?? []
    const _weights = character?.tracker_config?.event_weights ?? {}
    const stateValues = Array.isArray(character?.tracker_states)
      ? (character.tracker_states[0]?.state_values ?? {})
      : (character?.tracker_states?.state_values ?? {})

    if (!Array.isArray(palette) || palette.length === 0) {
      return NextResponse.json({ error: 'Character has no emotion_palette in tracker_config' }, { status: 400 })
    }

    const narrative = await generateEventNarrative({
      characterName: body.characterName || character?.name || '',
      dossierSummary: character?.dossier_text || body.dossierSummary || '',
      stateValues,
      emotionPalette: palette,

      category: body.category,
      subcategory: body.subcategory,
      reaction: body.reaction,
      apiKey: apiKey ?? undefined,
      userId: user.id,
      characterId: body.characterId,
    })

    return NextResponse.json({ narrative })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
