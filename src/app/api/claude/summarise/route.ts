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

    const { sessionId } = await req.json()
    if (!sessionId) return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })

    const apiKey = await getDecryptedApiKey(user.id)
    if (!apiKey) return NextResponse.json({ error: 'No API key configured' }, { status: 400 })

    // Fetch session, entries, and character note
    const [sessionRes, entriesRes, profileRes] = await Promise.all([
      (admin.from('sessions') as AnyRec).select('title, character_name').eq('id', sessionId).eq('player_id', user.id).single(),
      (admin.from('entries') as AnyRec).select('text, icon, category, created_at').eq('session_id', sessionId).order('created_at', { ascending: true }),
      (admin.from('profiles') as AnyRec).select('character_note').eq('id', user.id).single(),
    ])

    const session = sessionRes.data
    const entries: Array<{ text: string; icon: string | null; category: string | null }> = entriesRes.data || []
    const characterNote: string = profileRes.data?.character_note || ''
    const characterName: string = session?.character_name || 'The character'
    const sessionTitle: string = session?.title || ''

    if (entries.length === 0) {
      return NextResponse.json({ summary: 'A session with no recorded entries.' })
    }

    const entriesText = entries
      .map((e, i) => `${i + 1}. [${e.category || 'Note'}] ${e.text}`)
      .join('\n')

    const prompt = `Summarise this RPG session for the player to remember it by.
Write 3-4 sentences in past tense. Focus on what actually happened,
emotionally and narratively. No invented details — only what the entries describe.

Character: "${characterName}"
${characterNote ? `About ${characterName}: ${characterNote}` : ''}
Session title: "${sessionTitle || 'Untitled'}"
Entries:
${entriesText}

Return only the summary paragraph. No labels, no markdown.`

    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })

    const summary = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    return NextResponse.json({ summary })
  } catch (error) {
    return NextResponse.json({ summary: '', error: String(error) }, { status: 500 })
  }
}
