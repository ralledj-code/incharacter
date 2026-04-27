import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedApiKey } from '@/lib/getApiKey'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const apiKey = body.characterId ? await getDecryptedApiKey(user.id, body.characterId) : undefined
    const client = new Anthropic({ apiKey: apiKey || process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system: 'You write third-person psychological arc summaries for tabletop RPG characters. Specific, honest, based only on what you\'re told. No invented details. No em dashes — use commas or periods instead.',
      messages: [{
        role: 'user',
        content: `Character: ${body.characterName}
Sessions played: ${body.sessionCount}
Current trackers — Mask: ${body.trackers?.mask}/100, Dagger: ${body.trackers?.dagger}/100, Bottle: ${body.trackers?.bottle}/100, Wound: ${body.trackers?.wound}/100
Recent events: ${(body.recentEvents || []).slice(0, 4).join('. ')}

Write 2-3 sentences describing how this character has been changing psychologically across sessions. Third person, present tense. Reference specific tracker trends. Specific and honest. No generalities.`
      }]
    })

    const arc = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    return NextResponse.json({ arc })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
