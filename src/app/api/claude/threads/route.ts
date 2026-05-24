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
      .select('threads_initialised, threads_grouped')
      .eq('id', user.id)
      .single()
    const threadsInitialised: boolean = profileData?.threads_initialised ?? false
    const threadsGrouped: boolean = profileData?.threads_grouped ?? false

    const threads = await fetchThreadsHierarchy(user.id)
    // If threads exist but none are grouped yet, override the flag so the UI re-triggers grouping
    const hasAnyParent = threads.some((t: AnyRec) => (t.children ?? []).length > 0)
    const effectiveGrouped = threads.length === 0 ? threadsGrouped : (threadsGrouped && hasAnyParent)
    return NextResponse.json({ threads, threadsInitialised, threadsGrouped: effectiveGrouped })
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
      .select('api_key_encrypted, character_name, threads_grouped')
      .eq('id', user.id)
      .single()
    const keyBlob = profileData?.api_key_encrypted as string | null
    let decryptedKey: string | null = null
    if (keyBlob) {
      try { decryptedKey = decryptApiKey(keyBlob) } catch (e) { console.error('[threads] decrypt failed:', e) }
    }
    if (!decryptedKey) return NextResponse.json({ error: 'No API key configured' }, { status: 400 })
    const characterName = (profileData?.character_name as string | null) ?? null
    const threadsGrouped: boolean = profileData?.threads_grouped ?? false

    const existingThreads = await fetchThreadsWithUpdates(user.id)
    const openThreads = existingThreads.filter((t: AnyRec) => t.status === 'active')


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

    // Phase 2 — one-sentence summary per thread, all in parallel (only if new threads found)
    let successCount = 0
    if (identified.length > 0) {
      const summaries = await Promise.all(
        identified.map(async (thread) => {
          const triggerEntry = entries.find((e: AnyRec) => e.id === thread.entry_id)
          const entryText = triggerEntry?.text ?? entries[entries.length - 1]?.text ?? ''
          const entryTs = triggerEntry ? new Date(triggerEntry.created_at).toLocaleString() : ''
          const msg = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 200,
            messages: [{
              role: 'user',
              content: `Character: ${characterName ?? 'Unknown'}\nJournal entry [${entryTs}]: "${entryText}"\nThread: "${thread.title}"\n\nWrite one sentence describing the current unresolved situation for ${characterName ?? 'the character'}. Only facts from the entry, no invention. Return only the sentence.`,
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

      successCount = insertResults.filter(r => !r.error).length
      console.log('[threads] successful inserts:', successCount, 'of', identified.length)
    }

    // Phase 3 — group related threads + find updates to existing threads
    const allCurrentThreads = await fetchThreadsWithUpdates(user.id)
    const activeForPhase3 = allCurrentThreads.filter((t: AnyRec) => t.status === 'active')

    if (activeForPhase3.length > 0) {
      const doGrouping = retrospective === true
      const phase3Raw = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{ role: 'user', content: buildPhase3Prompt(characterName, activeForPhase3, entries, doGrouping) }],
      }).then(m => m.content[0].type === 'text' ? m.content[0].text.trim() : '{}')
      console.log('[threads] phase3 raw:', phase3Raw.substring(0, 500))

      type Phase3Result = { parent_groups?: AnyRec[]; thread_updates?: AnyRec[] }
      let phase3: Phase3Result = {}
      try {
        const cleaned = phase3Raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const start = cleaned.indexOf('{')
        const end = cleaned.lastIndexOf('}')
        if (start !== -1 && end !== -1) phase3 = JSON.parse(cleaned.substring(start, end + 1))
      } catch (e) {
        console.log('[threads] phase3 parse failed:', (e as Error).message)
      }

      const validThreadIds = new Set(activeForPhase3.map((t: AnyRec) => t.id))
      const validEntryIds = new Set(entries.map((e: AnyRec) => e.id))

      // Insert parent groups (retrospective only)
      let parentCreated = false
      if (doGrouping) {
        for (const group of (phase3.parent_groups ?? [])) {
          const childIds: string[] = (group.child_thread_ids ?? []).filter((id: string) => validThreadIds.has(id))
          if (childIds.length < 2) continue
          const { data: parent } = await (supabaseAdmin.from('quest_threads') as AnyRec)
            .insert({
              player_id: user.id,
              title: String(group.parent_title ?? '').slice(0, 200),
              summary: group.parent_summary ? String(group.parent_summary) : null,
              urgency: group.parent_urgency === 'urgent' ? 'urgent' : 'normal',
              status: 'active',
              parent_thread_id: null,
            })
            .select('id')
            .single()
          if (parent?.id) {
            parentCreated = true
            for (const childId of childIds) {
              await (supabaseAdmin.from('quest_threads') as AnyRec)
                .update({ parent_thread_id: parent.id })
                .eq('id', childId)
                .eq('player_id', user.id)
            }
            console.log('[threads] parent group:', group.parent_title, 'children:', childIds.length)
          }
        }
        if (parentCreated) {
          await (supabaseAdmin.from('profiles') as AnyRec)
            .update({ threads_grouped: true })
            .eq('id', user.id)
        }
      }

      // Insert thread updates (always)
      for (const tu of (phase3.thread_updates ?? [])) {
        if (!validThreadIds.has(tu.thread_id)) continue
        if (tu.entry_id && !validEntryIds.has(tu.entry_id)) continue
        const entry = tu.entry_id ? entries.find((e: AnyRec) => e.id === tu.entry_id) : null
        const sessionId = (entry as AnyRec | null)?.session_id ?? null
        await (supabaseAdmin.from('quest_thread_updates') as AnyRec)
          .insert({
            thread_id: tu.thread_id,
            player_id: user.id,
            session_id: sessionId,
            entry_id: tu.entry_id ?? null,
            update_text: String(tu.update_text ?? ''),
          })
        await (supabaseAdmin.from('quest_threads') as AnyRec)
          .update({ summary: String(tu.update_text ?? ''), updated_at: new Date().toISOString() })
          .eq('id', tu.thread_id)
          .eq('player_id', user.id)
        console.log('[threads] phase3 update thread:', tu.thread_id)
      }
    }

    if (retrospective && successCount > 0) {
      await (supabaseAdmin.from('profiles') as AnyRec)
        .update({ threads_initialised: true })
        .eq('id', user.id)
    }

    const updatedThreads = await fetchThreadsHierarchy(user.id)
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

async function fetchThreadsHierarchy(userId: string): Promise<AnyRec[]> {
  const { data: allThreads } = await (supabaseAdmin.from('quest_threads') as AnyRec)
    .select('*, updates:quest_thread_updates(id, thread_id, session_id, entry_id, update_text, created_at, sessions(title))')
    .eq('player_id', userId)
    .order('created_at', { ascending: true })
  if (!allThreads?.length) return []

  const parentThreads = allThreads.filter((t: AnyRec) => !t.parent_thread_id && t.status !== 'dismissed')
  const result = parentThreads.map((parent: AnyRec) => ({
    ...parent,
    updates: parent.updates ?? [],
    children: allThreads
      .filter((t: AnyRec) => t.parent_thread_id === parent.id)
      .map((c: AnyRec) => ({ ...c, updates: c.updates ?? [], children: [] }))
  }))
  const orphaned = allThreads.filter((t: AnyRec) =>
    !t.parent_thread_id &&
    !parentThreads.find((p: AnyRec) => p.id === t.id) &&
    t.status !== 'dismissed'
  )
  return [
    ...result,
    ...orphaned.map((t: AnyRec) => ({ ...t, updates: t.updates ?? [], children: [] }))
  ]
}

function buildPhase3Prompt(
  characterName: string | null,
  threads: AnyRec[],
  entries: AnyRec[],
  includeGrouping: boolean,
): string {
  const name = characterName ?? 'Unknown'
  const threadsBlock = threads
    .map((t: AnyRec) => `[${t.id}] "${t.title}" — ${t.summary ?? ''}`)
    .join('\n')
  const entriesBlock = entries
    .map((e: AnyRec) => `[${e.id}] [${new Date(e.created_at).toLocaleString()}] ${e.text}`)
    .join('\n')

  if (includeGrouping) {
    return `You are organising quest threads for ${name}'s RPG journal into a BG3-style quest hierarchy.

EXISTING THREADS:
${threadsBlock}

ALL JOURNAL ENTRIES (chronological):
${entriesBlock}

Group threads that share the same antagonist, location, cause or overarching goal into parent quests.
Think like BG3: "The Hunt for Severin" would be a parent with child threads about his location,
the assassin he sent, and the black blood plot he's behind.

RULES:
- Create parent threads only when 2+ children clearly belong together
- Parent title should be the overarching quest name
- Only use thread IDs from the list above
- ${name} is the player character, not "narrator" or "character"

Return ONLY valid JSON:
{
  "parent_groups": [
    {
      "parent_title": "The Hunt for Severin",
      "parent_summary": "one sentence overarching goal",
      "parent_urgency": "urgent|normal",
      "child_thread_ids": ["uuid1", "uuid2", "uuid3"]
    }
  ],
  "thread_updates": []
}
Return ONLY valid JSON, no markdown.`
  }

  return `You are updating quest threads for ${name}'s RPG journal.

EXISTING THREADS:
${threadsBlock}

ALL JOURNAL ENTRIES (chronological):
${entriesBlock}

IDENTIFY which journal entries UPDATE existing threads (new developments, not new threads).

RULES:
- Only reference thread IDs and entry IDs from the lists above
- Thread updates must reference entries that genuinely develop that thread
- ${name} is the player character, not "narrator" or "character"
- When in doubt, do not update

Return ONLY valid JSON:
{
  "parent_groups": [],
  "thread_updates": [
    {
      "thread_id": "existing-thread-uuid",
      "entry_id": "entry-uuid-that-updates-it",
      "update_text": "one sentence what changed"
    }
  ]
}
Return ONLY valid JSON, no markdown.`
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
    const ts = new Date(e.created_at).toLocaleString()
    return `[${e.id}] [${ts}] ${sessionTitle}: ${e.text}`
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
