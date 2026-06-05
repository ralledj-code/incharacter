import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptApiKey } from '@/lib/keyEncryption'
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

    const body = await req.json().catch(() => ({}))
    const { questId } = body as { questId?: string }
    if (!questId) return NextResponse.json({ error: 'Missing questId' }, { status: 400 })

    const { data: profileData } = await (admin.from('profiles') as AnyRec)
      .select('api_key_encrypted, character_name')
      .eq('id', user.id)
      .single()

    const keyBlob = profileData?.api_key_encrypted as string | null
    let decryptedKey: string | null = null
    if (keyBlob) {
      try { decryptedKey = decryptApiKey(keyBlob) } catch {}
    }
    if (!decryptedKey) return NextResponse.json({ error: 'No API key' }, { status: 400 })

    const characterName: string = (profileData?.character_name as string | null) ?? 'Unknown'

    const { data: quest } = await (admin.from('quests') as AnyRec)
      .select('id, title')
      .eq('id', questId)
      .eq('player_id', user.id)
      .single()
    if (!quest) return NextResponse.json({ error: 'Quest not found' }, { status: 404 })

    const { data: mapData } = await (admin.from('entry_quest_map') as AnyRec)
      .select('entry_id')
      .eq('quest_id', questId)

    const entryIds = (mapData ?? []).map((m: AnyRec) => m.entry_id as string)

    let entries: AnyRec[] = []
    if (entryIds.length > 0) {
      const { data } = await (admin.from('entries') as AnyRec)
        .select('id, text, created_at')
        .in('id', entryIds)
        .order('created_at', { ascending: true })
      entries = data ?? []
    }

    const client = new Anthropic({ apiKey: decryptedKey })

    const prompt = `You are updating the status of a quest in ${characterName}'s RPG journal.

QUEST: "${quest.title}"

ALL ENTRIES FOR THIS QUEST (chronological):
${entries.map((e: AnyRec) => `[${new Date(e.created_at).toLocaleString()}] ${e.text}`).join('\n')}

Write the CURRENT status of this quest in one sentence.
- Only facts explicitly written in the entries
- Present tense
- What is unresolved RIGHT NOW
- Use ${characterName} not "the narrator" or "the character"
- If the quest appears resolved based on the entries, say so clearly

Return ONLY the sentence, no JSON, no labels.`

    const statusText = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }).then(m => m.content[0].type === 'text' ? m.content[0].text.trim() : '')

    await (admin.from('quest_updates') as AnyRec)
      .update({ is_current: false })
      .eq('quest_id', questId)

    await (admin.from('quest_updates') as AnyRec)
      .insert({ quest_id: questId, status_text: statusText, is_current: true })

    await (admin.from('quests') as AnyRec)
      .update({ updated_at: new Date().toISOString() })
      .eq('id', questId)
      .eq('player_id', user.id)

    return NextResponse.json({ statusText })
  } catch (error) {
    console.error('[quest-update] error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
