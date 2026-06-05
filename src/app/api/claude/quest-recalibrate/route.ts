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
    const { questId, instruction } = body as { questId?: string; instruction?: string }
    if (!questId || !instruction?.trim()) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

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
      .select('id, title, status, urgency')
      .eq('id', questId)
      .eq('player_id', user.id)
      .single()
    if (!quest) return NextResponse.json({ error: 'Quest not found' }, { status: 404 })

    const { data: updatesData } = await (admin.from('quest_updates') as AnyRec)
      .select('id, status_text, is_current, created_at')
      .eq('quest_id', questId)
      .order('created_at', { ascending: false })
    const currentUpdate = (updatesData ?? []).find((u: AnyRec) => u.is_current)

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

    const prompt = `You are recalibrating a quest in ${characterName}'s RPG journal based on player instruction.

QUEST: "${quest.title}"
CURRENT STATUS: "${currentUpdate?.status_text ?? 'Unknown'}"

PLAYER INSTRUCTION: "${instruction}"

ALL ENTRIES (chronological):
${entries.map((e: AnyRec) => `[${new Date(e.created_at).toLocaleString()}] ${e.text}`).join('\n')}

Re-evaluate this quest considering the player's instruction.

Return ONLY valid JSON:
{
  "status": "active|resolved",
  "urgency": "urgent|normal",
  "status_text": "one sentence current state or resolution",
  "resolved_reason": "one sentence only if resolved, otherwise null"
}`

    const raw = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }).then(m => m.content[0].type === 'text' ? m.content[0].text.trim() : '{}')

    let parsed: { status?: string; urgency?: string; status_text?: string; resolved_reason?: string | null } = {}
    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const s = cleaned.indexOf('{'), e = cleaned.lastIndexOf('}')
      if (s !== -1 && e !== -1) parsed = JSON.parse(cleaned.substring(s, e + 1))
    } catch {}

    const newStatus = parsed.status === 'resolved' ? 'resolved' : 'active'
    const newUrgency = parsed.urgency === 'urgent' ? 'urgent' : 'normal'
    const statusText = parsed.status_text ?? ''

    await (admin.from('quest_updates') as AnyRec)
      .update({ is_current: false })
      .eq('quest_id', questId)

    await (admin.from('quest_updates') as AnyRec)
      .insert({ quest_id: questId, status_text: statusText, is_current: true })

    await (admin.from('quests') as AnyRec)
      .update({ status: newStatus, urgency: newUrgency, updated_at: new Date().toISOString() })
      .eq('id', questId)
      .eq('player_id', user.id)

    return NextResponse.json({
      id: questId,
      title: quest.title,
      status: newStatus,
      urgency: newUrgency,
      status_text: statusText,
    })
  } catch (error) {
    console.error('[quest-recalibrate] error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
