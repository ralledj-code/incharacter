import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as rawClient } from '@supabase/supabase-js'
import { analyzeDossier } from '@/lib/api'
import { getDecryptedApiKey } from '@/lib/getApiKey'

const admin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: character, error } = await (admin.from('characters') as any)
      .select('id, dossier_text, tracker_config')
      .eq('player_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !character) return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    if (!character.dossier_text) return NextResponse.json({ error: 'No dossier to analyze' }, { status: 400 })

    const apiKey = await getDecryptedApiKey(user.id, character.id)
    const result = await analyzeDossier({ dossierText: character.dossier_text, apiKey: apiKey ?? undefined })

    if (!result.characterConfig) return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })

    const existing = (character.tracker_config || {}) as Record<string, unknown>
    const updated_config = {
      ...existing,
      emotion_palette: result.characterConfig.emotion_palette,
      event_weights: result.characterConfig.event_weights,
      dangerous_element_category: result.characterConfig.dangerous_element_category,
      antagonist_category: result.characterConfig.antagonist_category,
      key_relationships: result.characterConfig.key_relationships,
      clue_board_name: result.characterConfig.clue_board_name,
      clue_board_subject: result.characterConfig.clue_board_subject,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateErr } = await (admin.from('characters') as any)
      .update({ tracker_config: updated_config })
      .eq('id', character.id)

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
