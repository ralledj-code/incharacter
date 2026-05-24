import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptApiKey } from '@/lib/keyEncryption'
import { createClient as rawClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

const supabaseAdmin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profileData } = await (supabaseAdmin.from('profiles') as AnyRec)
      .select('threads_initialised')
      .eq('id', user.id)
      .single()
    const threadsInitialised: boolean = profileData?.threads_initialised ?? false

    const threads = await fetchThreadsWithUpdates(user.id)
    return NextResponse.json({ threads, threadsInitialised })
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

    const { data: profileData } = await (supabaseAdmin.from('profiles') as AnyRec)
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

    // Always fetch full entry history — cross-session connections require complete context
    const { data: entryData } = await (supabaseAdmin.from('entries') as AnyRec)
      .select('id, text, icon, category, created_at, session_id, sessions(title)')
      .eq('player_id', user.id)
      .order('created_at', { ascending: true })
    const entries: AnyRec[] = entryData ?? []

    if (entries.length === 0) return NextResponse.json({ threads: existingThreads })

    const validEntryIds = new Set(entries.map((e: AnyRec) => e.id))
    const safeEntryId = (id: string | null | undefined): string | null =>
      (id && validEntryIds.has(id)) ? id : null
    const getSessionId = (entryId: string | null): string | null => {
      if (!entryId) return null
      return entries.find((e: AnyRec) => e.id === entryId)?.session_id ?? null
    }
    const mostRecentSessionId = entries.length > 0 ? entries[entries.length - 1].session_id : null

    const newEntry = newEntryId ? (entries.find((e: AnyRec) => e.id === newEntryId) ?? null) : null
    const prompt = buildPrompt(characterName, openThreads, entries, retrospective ?? false, newEntry)

    const client = new Anthropic({ apiKey: decryptedKey })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    console.log('[threads] raw:', raw.substring(0, 1000))

    const parsed = extractJSON(raw)

    // Insert new threads
    for (const nt of (parsed.new_threads ?? [])) {
      const entryId = safeEntryId(nt.entry_id)
      const sessionId = getSessionId(entryId)
      const threadInsertData = {
        player_id: user.id,
        title: String(nt.title ?? '').slice(0, 200),
        summary: nt.summary ? String(nt.summary) : null,
        urgency: nt.urgency === 'urgent' ? 'urgent' : 'normal',
        status: 'active',
        first_entry_id: entryId,
        last_updated_session_id: sessionId,
      }
      console.log('[threads] using admin client:', !!supabaseAdmin, 'insert data:', JSON.stringify(threadInsertData).substring(0, 200))
      const { data: newThread, error: threadError } = await (supabaseAdmin.from('quest_threads') as AnyRec)
        .insert(threadInsertData)
        .select('id')
        .single()
      console.log('[threads] insert error:', threadError?.message, threadError?.code, threadError?.details)
      console.log('[threads] insert quest_threads:', { id: newThread?.id, error: threadError?.message })
      if (newThread?.id && nt.first_update) {
        const updateInsertData = {
          thread_id: newThread.id,
          player_id: user.id,
          session_id: sessionId,
          entry_id: entryId,
          update_text: String(nt.first_update),
        }
        console.log('[threads] using admin client:', !!supabaseAdmin, 'insert data:', JSON.stringify(updateInsertData).substring(0, 200))
        const { data: newUpdate, error: updateError } = await (supabaseAdmin.from('quest_thread_updates') as AnyRec)
          .insert(updateInsertData)
          .select('id')
          .single()
        console.log('[threads] insert error:', updateError?.message, updateError?.code, updateError?.details)
        console.log('[threads] insert quest_thread_updates (new thread):', { id: newUpdate?.id, error: updateError?.message })
      }
    }

    // Insert updates for existing threads
    for (const tu of (parsed.thread_updates ?? [])) {
      if (!existingThreadIds.has(tu.thread_id)) continue
      const entryId = safeEntryId(tu.entry_id)
      const sessionId = getSessionId(entryId)
      const tuInsertData = {
        thread_id: tu.thread_id,
        player_id: user.id,
        session_id: sessionId,
        entry_id: entryId,
        update_text: String(tu.update_text ?? ''),
      }
      console.log('[threads] using admin client:', !!supabaseAdmin, 'insert data:', JSON.stringify(tuInsertData).substring(0, 200))
      const { data: tuUpdate, error: tuError } = await (supabaseAdmin.from('quest_thread_updates') as AnyRec)
        .insert(tuInsertData)
        .select('id')
        .single()
      console.log('[threads] insert error:', tuError?.message, tuError?.code, tuError?.details)
      console.log('[threads] insert quest_thread_updates (existing thread):', { id: tuUpdate?.id, error: tuError?.message })
      if (tu.new_summary) {
        await (supabaseAdmin.from('quest_threads') as AnyRec)
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
      const rtInsertData = {
        thread_id: rt.thread_id,
        player_id: user.id,
        session_id: mostRecentSessionId,
        entry_id: null,
        update_text: String(rt.update_text ?? 'Resolved.'),
      }
      console.log('[threads] using admin client:', !!supabaseAdmin, 'insert data:', JSON.stringify(rtInsertData).substring(0, 200))
      const { data: rtUpdate, error: rtError } = await (supabaseAdmin.from('quest_thread_updates') as AnyRec)
        .insert(rtInsertData)
        .select('id')
        .single()
      console.log('[threads] insert error:', rtError?.message, rtError?.code, rtError?.details)
      console.log('[threads] insert quest_thread_updates (resolve):', { id: rtUpdate?.id, error: rtError?.message })
      await (supabaseAdmin.from('quest_threads') as AnyRec)
        .update({
          status: 'resolved',
          resolved_session_id: mostRecentSessionId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', rt.thread_id)
        .eq('player_id', user.id)
    }

    if (retrospective) {
      await (supabaseAdmin.from('profiles') as AnyRec)
        .update({ threads_initialised: true })
        .eq('id', user.id)
    }

    const updatedThreads = await fetchThreadsWithUpdates(user.id)
    return NextResponse.json({ threads: updatedThreads })
  } catch (error) {
    console.error('[threads] error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { threadId, status } = body as { threadId?: string; status?: string }
    if (!threadId || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    await (supabaseAdmin.from('quest_threads') as AnyRec)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', threadId)
      .eq('player_id', user.id)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

async function fetchThreadsWithUpdates(userId: string): Promise<AnyRec[]> {
  const { data: threads } = await (supabaseAdmin.from('quest_threads') as AnyRec)
    .select('*')
    .eq('player_id', userId)
    .order('updated_at', { ascending: false })
  if (!threads?.length) return []

  const { data: updates } = await (supabaseAdmin.from('quest_thread_updates') as AnyRec)
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractJSON(raw: string): { new_threads: AnyRec[]; thread_updates: AnyRec[]; resolved_threads: AnyRec[] } {
  const empty = { new_threads: [], thread_updates: [], resolved_threads: [] }
  let cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) {
    console.error('[threads] No JSON object found in raw:', raw.substring(0, 500))
    return empty
  }
  cleaned = cleaned.substring(start, end + 1)
  try {
    return JSON.parse(cleaned)
  } catch {
    // Attempt to salvage truncated JSON by closing open structures
    let opens = 0
    for (const char of cleaned) {
      if (char === '[' || char === '{') opens++
      if (char === ']' || char === '}') opens--
    }
    let salvaged = cleaned
    while (opens > 0) {
      salvaged += '}'
      opens--
    }
    try {
      return JSON.parse(salvaged)
    } catch {
      console.error('[threads] JSON salvage failed, raw:', raw.substring(0, 500))
      return empty
    }
  }
}

function buildPrompt(
  characterName: string | null,
  threads: AnyRec[],
  entries: AnyRec[],
  retrospective: boolean,
  newEntry: AnyRec | null,
): string {
  const threadsBlock = threads.length > 0
    ? threads.map((t: AnyRec) => `[${t.id}] "${t.title}" — ${t.summary ?? ''}`).join('\n')
    : 'None yet.'

  const entriesBlock = entries.map((e: AnyRec) => {
    const sessionTitle = (e.sessions as AnyRec | null)?.title ?? 'Session'
    return `[${e.id}] ${sessionTitle} @ ${e.created_at}: ${e.icon ?? ''} ${e.category ?? ''}: ${e.text}`
  }).join('\n')

  return `You are maintaining a quest thread log for a tabletop RPG player's journal.
Think exactly like Baldur's Gate 3's quest journal -- threads open when something
unresolved is introduced, update when new information develops them,
and close when they are clearly resolved.

Character: ${characterName ?? 'Unknown'}

EXISTING OPEN THREADS:
${threadsBlock}

ALL JOURNAL ENTRIES (chronological):
${entriesBlock}

${newEntry
    ? `NEWLY ADDED ENTRY:\n[${newEntry.id}] ${newEntry.text}`
    : 'This is a retrospective analysis of all entries.'
  }

STRICT RULES:
- Only create threads for things explicitly written in the entries
- Never infer or assume things not written by the player
- Thread titles must use words or names from the entries
- Summaries must reflect only what was logged
- Connect entries only when the connection is explicit or strongly implied
- When in doubt, do not create a thread -- a missed thread is better than an invented one
- Maximum 8 new threads and 8 updates per call -- prioritise most significant

URGENCY:
- urgent: immediate danger, active threat, time pressure
- normal: important but not immediate

Return ONLY valid JSON, no markdown, no explanation:
{
  "new_threads": [
    {
      "title": "short thread name using words from the entries",
      "summary": "one sentence current state, only what is written",
      "urgency": "urgent|normal",
      "entry_id": "exact uuid of the entry that opens this thread",
      "first_update": "one sentence describing what opened this thread"
    }
  ],
  "thread_updates": [
    {
      "thread_id": "exact uuid of existing thread",
      "update_text": "one sentence describing what changed, only from entries",
      "entry_id": "exact uuid of the triggering entry",
      "new_summary": "updated one sentence current state"
    }
  ],
  "resolved_threads": [
    {
      "thread_id": "exact uuid of existing thread",
      "update_text": "one sentence describing how it resolved, only from entries"
    }
  ]
}`
}
