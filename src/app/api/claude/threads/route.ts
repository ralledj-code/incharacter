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

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const threads = await fetchThreadsWithUpdates(user.id)
    return NextResponse.json({ threads })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { newEntryId, retrospective } = body as { newEntryId?: string; retrospective?: boolean }

    const { data: profileData } = await (admin.from('profiles') as AnyRec)
      .select('api_key_encrypted, character_name')
      .eq('id', user.id)
      .single()
    const keyBlob = profileData?.api_key_encrypted as string | null
    let decryptedKey: string | null = null
    if (keyBlob) {
      try { decryptedKey = decryptApiKey(keyBlob) } catch (e) { console.error('[threads] decrypt failed:', e) }
    }
    if (!decryptedKey) return NextResponse.json({ error: 'No API key configured' }, { status: 400 })
    const characterName = (profileData?.character_name as string | null) ?? null

    const existingThreads = await fetchThreadsWithUpdates(user.id)
    const openThreads = existingThreads.filter((t: AnyRec) => t.status === 'active')
    const existingThreadIds = new Set(existingThreads.map((t: AnyRec) => t.id))

    // Fetch entries for context
    let entries: AnyRec[] = []
    if (retrospective) {
      const { data } = await (admin.from('entries') as AnyRec)
        .select('id, text, icon, category, created_at, session_id, sessions(title)')
        .eq('player_id', user.id)
        .order('created_at', { ascending: true })
      entries = data ?? []
    } else {
      const { data: recentSessions } = await (admin.from('sessions') as AnyRec)
        .select('id')
        .eq('player_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)
      const sessionIds = (recentSessions ?? []).map((s: AnyRec) => s.id)
      if (sessionIds.length > 0) {
        const { data } = await (admin.from('entries') as AnyRec)
          .select('id, text, icon, category, created_at, session_id, sessions(title)')
          .eq('player_id', user.id)
          .in('session_id', sessionIds)
          .order('created_at', { ascending: true })
        entries = data ?? []
      }
    }

    if (entries.length === 0) return NextResponse.json({ threads: existingThreads })

    const validEntryIds = new Set(entries.map((e: AnyRec) => e.id))
    const safeEntryId = (id: string | null | undefined): string | null =>
      (id && validEntryIds.has(id)) ? id : null
    const getSessionId = (entryId: string | null): string | null => {
      if (!entryId) return null
      return entries.find((e: AnyRec) => e.id === entryId)?.session_id ?? null
    }
    const mostRecentSessionId = entries.length > 0 ? entries[entries.length - 1].session_id : null

    const newEntry = newEntryId ? entries.find((e: AnyRec) => e.id === newEntryId) : null
    const prompt = buildPrompt(characterName, openThreads, entries, retrospective ?? false, newEntry)

    const client = new Anthropic({ apiKey: decryptedKey })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    console.log('[threads] raw:', raw.slice(0, 300))

    let parsed: { new_threads: AnyRec[]; thread_updates: AnyRec[]; resolved_threads: AnyRec[] } =
      { new_threads: [], thread_updates: [], resolved_threads: [] }

    try {
      const clean = raw.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      console.log('[threads] JSON parse failed, returning existing threads')
      return NextResponse.json({ threads: existingThreads })
    }

    // Insert new threads
    for (const nt of (parsed.new_threads ?? [])) {
      const entryId = safeEntryId(nt.entry_id)
      const sessionId = getSessionId(entryId)
      const { data: inserted } = await (admin.from('quest_threads') as AnyRec)
        .insert({
          player_id: user.id,
          title: String(nt.title ?? '').slice(0, 200),
          summary: nt.summary ? String(nt.summary) : null,
          urgency: nt.urgency === 'urgent' ? 'urgent' : 'normal',
          status: 'active',
          first_entry_id: entryId,
          last_updated_session_id: sessionId,
        })
        .select('id')
        .single()
      if (inserted?.id && nt.first_update) {
        await (admin.from('quest_thread_updates') as AnyRec).insert({
          thread_id: inserted.id,
          player_id: user.id,
          session_id: sessionId,
          entry_id: entryId,
          update_text: String(nt.first_update),
        })
      }
    }

    // Insert updates for existing threads
    for (const tu of (parsed.thread_updates ?? [])) {
      if (!existingThreadIds.has(tu.thread_id)) continue
      const entryId = safeEntryId(tu.entry_id)
      const sessionId = getSessionId(entryId)
      await (admin.from('quest_thread_updates') as AnyRec).insert({
        thread_id: tu.thread_id,
        player_id: user.id,
        session_id: sessionId,
        entry_id: entryId,
        update_text: String(tu.update_text ?? ''),
      })
      if (tu.new_summary) {
        await (admin.from('quest_threads') as AnyRec)
          .update({
            summary: String(tu.new_summary),
            last_updated_session_id: sessionId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', tu.thread_id)
          .eq('player_id', user.id)
      }
    }

    // Resolve threads
    for (const rt of (parsed.resolved_threads ?? [])) {
      if (!existingThreadIds.has(rt.thread_id)) continue
      await (admin.from('quest_thread_updates') as AnyRec).insert({
        thread_id: rt.thread_id,
        player_id: user.id,
        session_id: mostRecentSessionId,
        entry_id: null,
        update_text: String(rt.update_text ?? 'Resolved.'),
      })
      await (admin.from('quest_threads') as AnyRec)
        .update({
          status: 'resolved',
          resolved_session_id: mostRecentSessionId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', rt.thread_id)
        .eq('player_id', user.id)
    }

    const updatedThreads = await fetchThreadsWithUpdates(user.id)
    return NextResponse.json({ threads: updatedThreads })
  } catch (error) {
    console.error('[threads] error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

async function fetchThreadsWithUpdates(userId: string): Promise<AnyRec[]> {
  const { data: threads } = await (admin.from('quest_threads') as AnyRec)
    .select('*')
    .eq('player_id', userId)
    .order('updated_at', { ascending: false })
  if (!threads?.length) return []

  const { data: updates } = await (admin.from('quest_thread_updates') as AnyRec)
    .select('id, thread_id, session_id, entry_id, update_text, created_at, sessions(title)')
    .in('thread_id', threads.map((t: AnyRec) => t.id))
    .order('created_at', { ascending: true })

  const byThread = new Map<string, AnyRec[]>()
  for (const u of (updates ?? [])) {
    if (!byThread.has(u.thread_id)) byThread.set(u.thread_id, [])
    byThread.get(u.thread_id)!.push(u)
  }

  return threads.map((t: AnyRec) => ({ ...t, updates: byThread.get(t.id) ?? [] }))
}

function buildPrompt(
  characterName: string | null,
  threads: AnyRec[],
  entries: AnyRec[],
  retrospective: boolean,
  newEntry: AnyRec | null,
): string {
  const threadsBlock = threads.length > 0
    ? threads.map((t: AnyRec) => `- [${t.id}] ${t.title}: ${t.summary ?? ''}`).join('\n')
    : 'None'

  const entriesBlock = entries.map((e: AnyRec) => {
    const sessionTitle = (e.sessions as AnyRec | null)?.title ?? 'Unknown Session'
    const ts = new Date(e.created_at).toLocaleString()
    return `[${sessionTitle} ${ts}] ${e.icon ?? '📝'} ${e.category ?? 'Note'}: ${e.text}`
  }).join('\n')

  return `You are analysing a tabletop RPG player's session journal to maintain a quest thread log.

Character name: ${characterName ?? 'Unknown'}

Existing open threads:
${threadsBlock}

Journal entries (oldest first):
${entriesBlock}

${retrospective
    ? 'This is a retrospective analysis. Identify all threads across the full history.'
    : `New entry just logged: ${newEntry?.text ?? ''}`
  }

Identify:
1. NEW threads opened by these entries — unresolved situations, unanswered questions, introduced characters or locations with unclear significance
2. UPDATES to existing threads — new information that develops a known thread
3. RESOLVED threads — entries that clearly close a thread

Urgency rules:
- urgent: immediate danger, time pressure, active threat
- normal: important but not immediate

Return ONLY valid JSON:
{
  "new_threads": [
    {
      "title": "short thread name",
      "summary": "one sentence current state",
      "urgency": "urgent|normal",
      "entry_id": "uuid of the triggering entry",
      "first_update": "one sentence describing what opened this thread"
    }
  ],
  "thread_updates": [
    {
      "thread_id": "existing thread uuid",
      "update_text": "one sentence describing what changed",
      "entry_id": "uuid of the triggering entry",
      "new_summary": "updated one sentence current state"
    }
  ],
  "resolved_threads": [
    {
      "thread_id": "existing thread uuid",
      "update_text": "one sentence describing how it resolved"
    }
  ]
}

No explanation. No markdown. Only JSON.`
}
