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
    const { entryId } = body as { entryId?: string }
    if (!entryId) return NextResponse.json({ error: 'Missing entryId' }, { status: 400 })

    const { data: profileData, error: profileError } = await (admin.from('profiles') as AnyRec)
      .select('api_key_encrypted, character_name')
      .eq('id', user.id)
      .single()
    if (profileError) console.error('[quest-assign] profiles fetch error:', profileError)
    console.log('[quest-assign] profile:', { userId: user.id, hasKeyBlob: !!profileData?.api_key_encrypted, hasName: !!profileData?.character_name })

    const keyBlob = profileData?.api_key_encrypted as string | null
    let decryptedKey: string | null = null
    if (keyBlob) {
      try { decryptedKey = decryptApiKey(keyBlob) } catch (e) { console.error('[quest-assign] decrypt failed:', e) }
    }
    if (!decryptedKey) return NextResponse.json({ error: 'No API key' }, { status: 400 })

    const characterName: string = (profileData?.character_name as string | null) ?? 'Unknown'

    const { data: entryData } = await (admin.from('entries') as AnyRec)
      .select('id, text')
      .eq('id', entryId)
      .single()
    if (!entryData) return NextResponse.json({ error: 'Entry not found' }, { status: 404 })

    const { data: existingQuests, error: questsError } = await (admin.from('quests') as AnyRec)
      .select('id, title')
      .eq('player_id', user.id)
      .eq('status', 'active')
    if (questsError) console.error('[quest-assign] quests fetch error:', questsError)

    const quests: AnyRec[] = existingQuests ?? []

    const client = new Anthropic({ apiKey: decryptedKey })

    const prompt = `You are managing a quest log for ${characterName}'s RPG journal.

EXISTING QUESTS:
${quests.map((q: AnyRec) => `[${q.id}] ${q.title}`).join('\n') || 'None yet.'}

NEW JOURNAL ENTRY:
"${entryData.text}"

Does this entry belong to an existing quest, or does it open a new one?

RULES:
- Only create a new quest if the entry introduces a genuinely new unresolved situation
- Quest titles are HIGH LEVEL (e.g. "The Werewolf Crisis", "Hunt for Severin", "Lucien's Secret")
- Never create duplicate quests for the same situation
- An entry can belong to an existing quest even if it doesn't mention it by name
- If the entry is routine or doesn't relate to any quest, return quest_id: null and new_quest_title: null
- ${characterName} is the player character

Return ONLY valid JSON:
{
  "quest_id": "existing uuid or null",
  "new_quest_title": "only if quest_id is null and a new quest is warranted, otherwise null",
  "new_quest_urgency": "urgent|normal"
}`

    const raw = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    }).then(m => m.content[0].type === 'text' ? m.content[0].text.trim() : '{}')

    let parsed: { quest_id?: string | null; new_quest_title?: string | null; new_quest_urgency?: string } = {}
    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const s = cleaned.indexOf('{'), e = cleaned.lastIndexOf('}')
      if (s !== -1 && e !== -1) parsed = JSON.parse(cleaned.substring(s, e + 1))
    } catch {}

    let questId: string | null = parsed.quest_id ?? null

    // Validate quest_id is real
    if (questId && !quests.find((q: AnyRec) => q.id === questId)) questId = null

    // Create new quest if warranted
    if (!questId && parsed.new_quest_title) {
      const { data: newQuest } = await (admin.from('quests') as AnyRec)
        .insert({
          player_id: user.id,
          title: String(parsed.new_quest_title).slice(0, 200),
          status: 'active',
          urgency: parsed.new_quest_urgency === 'urgent' ? 'urgent' : 'normal',
        })
        .select('id')
        .single()
      questId = newQuest?.id ?? null
    }

    if (questId) {
      await (admin.from('entry_quest_map') as AnyRec)
        .upsert({ entry_id: entryId, quest_id: questId })
    }

    return NextResponse.json({ questId, isNew: !parsed.quest_id && !!parsed.new_quest_title })
  } catch (error) {
    console.error('[quest-assign] error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
