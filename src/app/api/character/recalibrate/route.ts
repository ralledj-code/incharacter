import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as rawClient } from '@supabase/supabase-js'
import { getDecryptedApiKey } from '@/lib/getApiKey'
import Anthropic from '@anthropic-ai/sdk'

const admin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  console.log('RECALIBRATE HIT')
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    console.log('RECALIBRATE HIT for user:', user.id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: character, error } = await (admin.from('characters') as any)
      .select('id, dossier_text, tracker_config')
      .eq('player_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !character) return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    if (!character.dossier_text) return NextResponse.json({ error: 'No dossier to analyze' }, { status: 400 })

    console.log('[recalibrate] calling Claude for character:', character.id)

    const apiKey = await getDecryptedApiKey(user.id, character.id)
    const anthropic = new Anthropic({ apiKey: apiKey || process.env.ANTHROPIC_API_KEY })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are analyzing a character dossier to generate a psychological tracker config.

Return ONLY valid JSON with exactly these fields:

{
  "emotion_palette": [
    { "id": "state_1", "name": "short state name", "description": "one sentence", "base_value": 40 },
    { "id": "state_2", "name": "short state name", "description": "one sentence", "base_value": 35 },
    { "id": "state_3", "name": "short state name", "description": "one sentence", "base_value": 30 },
    { "id": "state_4", "name": "short state name", "description": "one sentence", "base_value": 25 },
    { "id": "state_5", "name": "short state name", "description": "one sentence", "base_value": 20 },
    { "id": "state_6", "name": "short state name", "description": "one sentence", "base_value": 15 }
  ],
  "event_weights": {
    "violence":     { "state_1": 8,  "state_2": -4 },
    "performance":  { "state_1": -5, "state_3": 7  },
    "avoided":      { "state_4": 6,  "state_2": -3 },
    "indulged":     { "state_5": 9,  "state_1": -5 },
    "opened_up":    { "state_6": 10, "state_4": -6 },
    "crossed_line": { "state_2": 8,  "state_5": 5  },
    "antagonist":   { "state_3": 7,  "state_2": 4  },
    "special":      { "state_1": -4, "state_2": 10 }
  }
}

State names and descriptions must come from this dossier:
${character.dossier_text}

Use IDs exactly as shown (state_1 through state_6). Values between -10 and +10. No other fields. No markdown. No explanation.`,
      }],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    console.log('[recalibrate] raw Claude response:', raw)

    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.log('[recalibrate] no JSON found in response')
      return NextResponse.json({ error: 'Claude did not return valid JSON' }, { status: 500 })
    }

    let parsed: { emotion_palette?: unknown; event_weights?: unknown }
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch (e) {
      console.log('[recalibrate] JSON parse failed:', String(e))
      return NextResponse.json({ error: 'Failed to parse Claude response' }, { status: 500 })
    }

    console.log('[recalibrate] parsed emotion_palette:', JSON.stringify(parsed.emotion_palette))
    console.log('[recalibrate] parsed event_weights:', JSON.stringify(parsed.event_weights))

    if (!parsed.emotion_palette || !parsed.event_weights) {
      console.log('[recalibrate] missing required fields')
      return NextResponse.json({ error: 'Claude response missing emotion_palette or event_weights' }, { status: 500 })
    }

    const existing = (character.tracker_config || {}) as Record<string, unknown>
    const updated_config = {
      ...existing,
      emotion_palette: parsed.emotion_palette,
      event_weights: parsed.event_weights,
    }

    console.log('[recalibrate] writing tracker_config:', JSON.stringify({ emotion_palette: parsed.emotion_palette, event_weights: parsed.event_weights }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateErr } = await (admin.from('characters') as any)
      .update({ tracker_config: updated_config })
      .eq('id', character.id)

    if (updateErr) {
      console.log('[recalibrate] DB write error:', updateErr.message)
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    console.log('[recalibrate] done — tracker_config written for:', character.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('RECALIBRATE CRASH:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
