import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedApiKey } from '@/lib/getApiKey'
import { createClient as rawClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

const admin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { entryId, text, characterName } = await req.json()
    if (!text?.trim()) return NextResponse.json({ error: 'text is required' }, { status: 400 })

    const apiKey = await getDecryptedApiKey(user.id)
    if (!apiKey) return NextResponse.json({ error: 'No API key configured' }, { status: 400 })

    const prompt = `Given this journal entry from a tabletop RPG session, assign:
1. A single emoji that represents what happened
2. A one-word category (Violence, Betrayal, Bond, Loss, Revelation, Humour, Fear, Victory, Rest, Mystery)

Entry: "${text}"
Character: "${characterName || 'Unknown'}"

Return only JSON: { "icon": "emoji", "category": "word" }
No explanation, no markdown.`

    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 64,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    console.log('[categorise] raw Claude response:', raw)
    let icon = '📝'
    let category = 'Note'

    try {
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      if (parsed.icon) icon = parsed.icon
      if (parsed.category) category = parsed.category
    } catch {
      console.log('[categorise] JSON parse failed, using fallback. raw:', raw)
    }

    // Update entry in DB
    if (entryId) {
      await (admin.from('entries') as AnyRec)
        .update({ icon, category, updated_at: new Date().toISOString() })
        .eq('id', entryId)
        .eq('player_id', user.id)
    }

    return NextResponse.json({ icon, category })
  } catch (error) {
    return NextResponse.json({ icon: '📝', category: 'Note', error: String(error) })
  }
}
