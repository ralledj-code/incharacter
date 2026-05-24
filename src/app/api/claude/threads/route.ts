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

    const newEntry = newEntryId ? (entries.find((e: AnyRec) => e.id === newEntryId) ?? null) : null

    const client = new Anthropic({ apiKey: decryptedKey })

    // Phase 1 — identify new threads (small call, guaranteed complete)
    const phase1Raw = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{ role: 'user', content: buildPhase1Prompt(characterName, openThreads, entries, newEntry) }],
    }).then(m => m.content[0].type === 'text' ? m.content[0].text.trim() : '[]')
    console.log('[threads] phase1 raw:', phase1Raw)

    type Phase1Thread = { title: string; entry_id: string; urgency: string }
    let identified: Phase1Thread[] = []
    try {
      const cleaned = phase1Raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const start = cleaned.indexOf('[')
      const end = cleaned.lastIndexOf(']')
      if (start !== -1 && end !== -1) identified = JSON.parse(cleaned.substring(start, end + 1))
    } catch (e) {
      console.log('[threads] phase1 parse failed:', (e as Error).message)
    }
    console.log('[threads] identified', identified.length, 'new threads')

    if (identified.length === 0) {
      const updatedThreads = await fetchThreadsWithUpdates(user.id)
      return NextResponse.json({ threads: updatedThreads })
    }

    // Phase 2 — one-sentence summary per thread, all in parallel (each call tiny)
    const summaries = await Promise.all(
      identified.map(async (thread) => {
        const triggerEntry = entries.find((e: AnyRec) => e.id === thread.entry_id)
        const entryText = triggerEntry?.text ?? entries[entries.length - 1]?.text ?? ''
        const msg = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 200,
          messages: [{
            role: 'user',
            content: `Journal entry: "${entryText}"\nThread: "${thread.title}"\n\nWrite one sentence describing the current unresolved situation. Only facts from the entry, no invention. Return only the sentence.`,
          }],
        })
        return msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
      })
    )

    // Insert threads with FK-validated entry IDs
    const insertResults: { error: AnyRec | null }[] = []
    for (let i = 0; i < identified.length; i++) {
      const nt = identified[i]
      const summary = summaries[i] || null

      let validEntryId: string | null = null
      let validSessionId: string | null = null
      if (nt.entry_id) {
        const { data: entryCheck } = await (supabaseAdmin.from('entries') as AnyRec)
          .select('id, session_id')
          .eq('id', nt.entry_id)
          .single()
        if (entryCheck) {
          validEntryId = entryCheck.id as string
          validSessionId = (entryCheck.session_id as string) ?? null
        } else {
          console.log('[threads] invalid entry_id from Claude:', nt.entry_id)
        }
      }

      const { data, error } = await (supabaseAdmin.from('quest_threads') as AnyRec)
        .insert({
          player_id: user.id,
          title: String(nt.title ?? '').slice(0, 200),
          summary,
          urgency: nt.urgency === 'urgent' ? 'urgent' : 'normal',
          status: 'active',
          first_entry_id: validEntryId,
          first_seen_session_id: validSessionId,
        })
        .select('id')
        .single()
      console.log('[threads] insert:', { title: nt.title, id: data?.id, error: error?.message })
      insertResults.push({ error })

      if (data?.id && summary) {
        const { error: updateError } = await (supabaseAdmin.from('quest_thread_updates') as AnyRec)
          .insert({
            thread_id: data.id,
            player_id: user.id,
            session_id: validSessionId,
            entry_id: validEntryId,
            update_text: summary,
          })
        console.log('[threads] insert update:', { thread: nt.title, error: updateError?.message })
      }
    }

    const successCount = insertResults.filter(r => !r.error).length
    console.log('[threads] successful inserts:', successCount, 'of', identified.length)

    if (retrospective && successCount > 0) {
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

function buildPhase1Prompt(
  characterName: string | null,
  openThreads: AnyRec[],
  entries: AnyRec[],
  newEntry: AnyRec | null,
): string {
  const existingBlock = openThreads.length > 0
    ? openThreads.map((t: AnyRec) => `- "${t.title}"`).join('\n')
    : 'None.'

  const entriesBlock = entries.map((e: AnyRec) => {
    const sessionTitle = (e.sessions as AnyRec | null)?.title ?? 'Session'
    return `[${e.id}] ${sessionTitle}: ${e.text}`
  }).join('\n')

  return `You are a quest journal tracker for a tabletop RPG.
Character: ${characterName ?? 'Unknown'}

EXISTING OPEN THREADS (do not recreate these):
${existingBlock}

ALL JOURNAL ENTRIES:
${entriesBlock}

${newEntry ? `NEWLY ADDED ENTRY:\n[${newEntry.id}] ${newEntry.text}` : 'This is a retrospective analysis.'}

List only NEW unresolved situations not already tracked above.
Return ONLY a JSON array, nothing else:
[
  { "title": "short name using words from the entries", "entry_id": "exact uuid from the list above", "urgency": "urgent|normal" }
]

Rules:
- Only situations explicitly written in the entries, never invent
- Add "urgency": "urgent" if immediate danger or active threat, otherwise "normal"
- entry_id must be an exact UUID copied from the entries list above
- Maximum 8 threads. If nothing new, return [].
Return ONLY the JSON array.`
}
