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
    const { newEntryId, retrospective, regroup } = body as {
      newEntryId?: string
      retrospective?: boolean
      regroup?: boolean
    }

    const { data: profileData } = await (supabaseAdmin.from('profiles') as AnyRec)
      .select('api_key_encrypted, character_name, threads_initialised')
      .eq('id', user.id)
      .single()
    const keyBlob = profileData?.api_key_encrypted as string | null
    let decryptedKey: string | null = null
    if (keyBlob) {
      try { decryptedKey = decryptApiKey(keyBlob) } catch (e) { console.error('[threads] decrypt failed:', e) }
    }
    if (!decryptedKey) return NextResponse.json({ error: 'No API key configured' }, { status: 400 })
    const characterName: string = (profileData?.character_name as string | null) ?? 'Unknown'
    const threadsInitialised: boolean = profileData?.threads_initialised ?? false

    const { data: entryData } = await (supabaseAdmin.from('entries') as AnyRec)
      .select('id, text, icon, category, created_at, session_id, sessions(title)')
      .eq('player_id', user.id)
      .order('created_at', { ascending: true })
    const entries: AnyRec[] = entryData ?? []

    if (entries.length === 0) {
      const threads = await fetchThreadsHierarchy(user.id)
      return NextResponse.json({ threads })
    }

    const client = new Anthropic({ apiKey: decryptedKey })

    // ── FLOW 1: Retrospective — runs exactly once ─────────────────────────────
    if (retrospective && !threadsInitialised) {
      const existingThreads = await fetchThreadsWithUpdates(user.id)
      const openThreads = existingThreads.filter((t: AnyRec) => t.status === 'active')

      // Phase 1: identify all threads from full history
      const phase1Raw = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: buildPhase1Prompt(characterName, openThreads, entries, null) }],
      }).then(m => m.content[0].type === 'text' ? m.content[0].text.trim() : '[]')
      console.log('[threads] retro phase1:', phase1Raw.substring(0, 300))

      type P1Thread = { title: string; entry_id: string; urgency: string }
      let identified: P1Thread[] = []
      try {
        const c = phase1Raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const s = c.indexOf('['), e = c.lastIndexOf(']')
        if (s !== -1 && e !== -1) identified = JSON.parse(c.substring(s, e + 1))
      } catch (e) { console.log('[threads] retro phase1 parse failed:', (e as Error).message) }
      console.log('[threads] retro identified:', identified.length)

      // Phase 2: summaries + insert
      if (identified.length > 0) {
        const summaries = await Promise.all(identified.map(async (th) => {
          const trigger = entries.find((e: AnyRec) => e.id === th.entry_id) ?? null
          const msg = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 200,
            messages: [{ role: 'user', content: buildPhase2Prompt(characterName, th.title, trigger) }],
          })
          return msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
        }))

        for (let i = 0; i < identified.length; i++) {
          const nt = identified[i]
          const summary = summaries[i] || null
          const { validEntryId, validSessionId } = await validateEntryId(nt.entry_id)
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
            .select('id').single()
          console.log('[threads] retro insert:', { title: nt.title, id: data?.id, error: error?.message })
          if (data?.id && summary) {
            await (supabaseAdmin.from('quest_thread_updates') as AnyRec)
              .insert({ thread_id: data.id, player_id: user.id, session_id: validSessionId, entry_id: validEntryId, update_text: summary })
          }
        }
      }

      // Phase 3: create parent groups from all active threads
      const allForGrouping = await fetchThreadsWithUpdates(user.id)
      const activeForGrouping = allForGrouping.filter((t: AnyRec) => t.status === 'active')
      let parentCreated = false
      if (activeForGrouping.length > 1) {
        const phase3Raw = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1500,
          messages: [{ role: 'user', content: buildPhase3GroupPrompt(characterName, activeForGrouping, entries) }],
        }).then(m => m.content[0].type === 'text' ? m.content[0].text.trim() : '{}')
        console.log('[threads] retro phase3:', phase3Raw.substring(0, 500))
        const { parent_groups } = parsePhase3Result(phase3Raw)
        const validIds = new Set(activeForGrouping.map((t: AnyRec) => t.id as string))
        parentCreated = await insertParentGroups(user.id, parent_groups, validIds)
      }

      // Always mark initialised after retrospective runs (analysis complete regardless of count)
      const profileUpdate: AnyRec = { threads_initialised: true }
      if (parentCreated) profileUpdate.threads_grouped = true
      await (supabaseAdmin.from('profiles') as AnyRec).update(profileUpdate).eq('id', user.id)

      const updatedThreads = await fetchThreadsHierarchy(user.id)
      return NextResponse.json({ threads: updatedThreads })
    }

    // ── FLOW 2: New entry ────────────────────────────────────────────────────
    if (newEntryId) {
      const existingThreads = await fetchThreadsWithUpdates(user.id)
      const openThreads = existingThreads.filter((t: AnyRec) => t.status === 'active')
      const newEntry = entries.find((e: AnyRec) => e.id === newEntryId) ?? null

      // Phase 1: max 2 new threads
      const phase1Raw = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{ role: 'user', content: buildPhase1Prompt(characterName, openThreads, entries, newEntry, 2) }],
      }).then(m => m.content[0].type === 'text' ? m.content[0].text.trim() : '[]')
      console.log('[threads] new-entry phase1:', phase1Raw)

      type P1Thread = { title: string; entry_id: string; urgency: string }
      let identified: P1Thread[] = []
      try {
        const c = phase1Raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const s = c.indexOf('['), e = c.lastIndexOf(']')
        if (s !== -1 && e !== -1) identified = JSON.parse(c.substring(s, e + 1))
      } catch (e) { console.log('[threads] new-entry phase1 parse failed:', (e as Error).message) }

      if (identified.length > 0) {
        // Phase 2: summaries (parallel)
        const summaries = await Promise.all(identified.map(async (th) => {
          const trigger = entries.find((e: AnyRec) => e.id === th.entry_id) ?? newEntry
          const msg = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 200,
            messages: [{ role: 'user', content: buildPhase2Prompt(characterName, th.title, trigger) }],
          })
          return msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
        }))

        // Fetch existing parent threads for Phase 3-lite
        const hierarchy = await fetchThreadsHierarchy(user.id)
        const existingParents = hierarchy.filter((t: AnyRec) =>
          (t.children ?? []).length > 0 && t.status === 'active'
        )

        // Insert each new thread then run Phase 3-lite
        for (let i = 0; i < identified.length; i++) {
          const nt = identified[i]
          const summary = summaries[i] || null
          const { validEntryId, validSessionId } = await validateEntryId(nt.entry_id)
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
            .select('id').single()
          console.log('[threads] new-entry insert:', { title: nt.title, id: data?.id, error: error?.message })
          if (data?.id && summary) {
            await (supabaseAdmin.from('quest_thread_updates') as AnyRec)
              .insert({ thread_id: data.id, player_id: user.id, session_id: validSessionId, entry_id: validEntryId, update_text: summary })
          }

          // Phase 3-lite: check if new thread belongs under an existing parent
          if (data?.id && existingParents.length > 0) {
            const liteRaw = await client.messages.create({
              model: 'claude-haiku-4-5-20251001',
              max_tokens: 150,
              messages: [{
                role: 'user',
                content: buildPhase3LitePrompt(
                  characterName,
                  { id: data.id, title: nt.title, summary: summary ?? '' },
                  existingParents,
                ),
              }],
            }).then(m => m.content[0].type === 'text' ? m.content[0].text.trim() : '{}')
            console.log('[threads] phase3-lite:', liteRaw)
            try {
              const cleaned = liteRaw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
              const s = cleaned.indexOf('{'), e = cleaned.lastIndexOf('}')
              if (s !== -1 && e !== -1) {
                const result = JSON.parse(cleaned.substring(s, e + 1))
                if (result.parent_id && result.confidence === 'high') {
                  const validParent = existingParents.find((p: AnyRec) => p.id === result.parent_id)
                  if (validParent) {
                    await (supabaseAdmin.from('quest_threads') as AnyRec)
                      .update({ parent_thread_id: result.parent_id })
                      .eq('id', data.id).eq('player_id', user.id)
                    console.log('[threads] phase3-lite matched:', validParent.title)
                  }
                }
              }
            } catch (e) { console.log('[threads] phase3-lite parse failed:', (e as Error).message) }
          }
        }
      }

      const updatedThreads = await fetchThreadsHierarchy(user.id)
      return NextResponse.json({ threads: updatedThreads })
    }

    // ── FLOW 3: Manual regroup ───────────────────────────────────────────────
    if (regroup) {
      const allThreads = await fetchThreadsWithUpdates(user.id)
      const parentIds = new Set(
        allThreads.filter((t: AnyRec) => t.parent_thread_id).map((t: AnyRec) => t.parent_thread_id as string)
      )
      // Orphans: active threads that have no parent and are not themselves parents
      const orphans = allThreads.filter((t: AnyRec) =>
        t.status === 'active' && !t.parent_thread_id && !parentIds.has(t.id)
      )
      const existingParents = allThreads.filter((t: AnyRec) => parentIds.has(t.id))
      console.log('[threads] regroup orphans:', orphans.length, 'existing parents:', existingParents.length)

      if (orphans.length > 0) {
        const phase3Raw = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1500,
          messages: [{ role: 'user', content: buildPhase3RegroupPrompt(characterName, orphans, existingParents, entries) }],
        }).then(m => m.content[0].type === 'text' ? m.content[0].text.trim() : '{}')
        console.log('[threads] regroup phase3:', phase3Raw.substring(0, 500))

        const { parent_groups, attach_to_existing } = parsePhase3Result(phase3Raw)
        const validOrphanIds = new Set(orphans.map((t: AnyRec) => t.id as string))
        const validParentIds = new Set(existingParents.map((t: AnyRec) => t.id as string))
        await insertParentGroups(user.id, parent_groups, validOrphanIds)
        await attachToExistingParents(user.id, attach_to_existing, validOrphanIds, validParentIds)
      }

      const updatedThreads = await fetchThreadsHierarchy(user.id)
      return NextResponse.json({ threads: updatedThreads })
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

// ── DB helpers ────────────────────────────────────────────────────────────────

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

async function validateEntryId(
  entryId: string | null | undefined,
): Promise<{ validEntryId: string | null; validSessionId: string | null }> {
  if (!entryId) return { validEntryId: null, validSessionId: null }
  const { data } = await (supabaseAdmin.from('entries') as AnyRec)
    .select('id, session_id')
    .eq('id', entryId)
    .single()
  if (!data) {
    console.log('[threads] invalid entry_id from Claude:', entryId)
    return { validEntryId: null, validSessionId: null }
  }
  return { validEntryId: data.id as string, validSessionId: (data.session_id as string) ?? null }
}

function parsePhase3Result(raw: string): { parent_groups: AnyRec[]; attach_to_existing: AnyRec[] } {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const s = cleaned.indexOf('{'), e = cleaned.lastIndexOf('}')
    if (s !== -1 && e !== -1) {
      const parsed = JSON.parse(cleaned.substring(s, e + 1))
      return {
        parent_groups: parsed.parent_groups ?? [],
        attach_to_existing: parsed.attach_to_existing ?? [],
      }
    }
  } catch (e) { console.log('[threads] phase3 parse failed:', (e as Error).message) }
  return { parent_groups: [], attach_to_existing: [] }
}

async function insertParentGroups(
  userId: string,
  groups: AnyRec[],
  validChildIds: Set<string>,
): Promise<boolean> {
  let created = false
  for (const group of groups) {
    const childIds: string[] = (group.child_thread_ids ?? []).filter((id: string) => validChildIds.has(id))
    if (childIds.length < 2) continue
    const { data: parent } = await (supabaseAdmin.from('quest_threads') as AnyRec)
      .insert({
        player_id: userId,
        title: String(group.parent_title ?? '').slice(0, 200),
        summary: group.parent_summary ? String(group.parent_summary) : null,
        urgency: group.parent_urgency === 'urgent' ? 'urgent' : 'normal',
        status: 'active',
        parent_thread_id: null,
      })
      .select('id').single()
    if (parent?.id) {
      created = true
      for (const childId of childIds) {
        await (supabaseAdmin.from('quest_threads') as AnyRec)
          .update({ parent_thread_id: parent.id })
          .eq('id', childId).eq('player_id', userId)
      }
      console.log('[threads] created parent:', group.parent_title, 'children:', childIds.length)
    }
  }
  return created
}

async function attachToExistingParents(
  userId: string,
  attachments: AnyRec[],
  validOrphanIds: Set<string>,
  validParentIds: Set<string>,
): Promise<void> {
  for (const att of attachments) {
    if (!validParentIds.has(att.parent_id)) continue
    const childIds: string[] = (att.child_thread_ids ?? []).filter((id: string) => validOrphanIds.has(id))
    for (const childId of childIds) {
      await (supabaseAdmin.from('quest_threads') as AnyRec)
        .update({ parent_thread_id: att.parent_id })
        .eq('id', childId).eq('player_id', userId)
      console.log('[threads] attached orphan to existing parent:', att.parent_id)
    }
  }
}

// ── Prompt builders ───────────────────────────────────────────────────────────

function formatEntries(entries: AnyRec[]): string {
  return entries.map(e => {
    const d = new Date(e.created_at)
    const label = `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
    return `[${e.id}] [${label}] ${e.text}`
  }).join('\n')
}

function buildPhase2Prompt(characterName: string, threadTitle: string, triggerEntry: AnyRec | null): string {
  const entryText = triggerEntry?.text ?? ''
  const entryTs = triggerEntry
    ? (() => { const d = new Date(triggerEntry.created_at); return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}` })()
    : ''
  return `Character: ${characterName}
Journal entry [${entryTs}]: "${entryText}"
Thread: "${threadTitle}"

Write one sentence describing the current unresolved situation for ${characterName}. Only facts from the entry, no invention. Return only the sentence.

CRITICAL: Never refer to ${characterName} as "the narrator", "the character", or any generic term. Use ${characterName} by name.`
}

function buildPhase1Prompt(
  characterName: string,
  openThreads: AnyRec[],
  entries: AnyRec[],
  newEntry: AnyRec | null,
  maxThreads = 8,
): string {
  const existingBlock = openThreads.length > 0
    ? openThreads.map((t: AnyRec) => `- "${t.title}"`).join('\n')
    : 'None.'

  const eBlock = entries.map((e: AnyRec) => {
    const sessionTitle = (e.sessions as AnyRec | null)?.title ?? 'Session'
    const d = new Date(e.created_at)
    const label = `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
    return `[${e.id}] [${label}] ${sessionTitle}: ${e.text}`
  }).join('\n')

  return `You are a quest journal tracker for a tabletop RPG.
Character: ${characterName}

EXISTING OPEN THREADS (do not recreate these):
${existingBlock}

ALL JOURNAL ENTRIES:
${eBlock}

${newEntry ? `NEWLY ADDED ENTRY:\n[${newEntry.id}] ${newEntry.text}` : 'This is a retrospective analysis.'}

List only NEW unresolved situations not already tracked above.
Return ONLY a JSON array, nothing else:
[
  { "title": "short name using words from the entries", "entry_id": "exact uuid from the list above", "urgency": "urgent|normal" }
]

CRITICAL RULES:
- Only situations explicitly written in the entries, never invent
- entry_id must be an exact UUID copied from the entries list above
- ${characterName} is the player character — never say "narrator" or "character"
- Maximum ${maxThreads} threads. If nothing new, return [].
Return ONLY the JSON array.`
}

function buildPhase3GroupPrompt(characterName: string, threads: AnyRec[], entries: AnyRec[]): string {
  const threadsBlock = threads
    .map((t: AnyRec) => `[${t.id}] "${t.title}" — ${t.summary ?? ''}`)
    .join('\n')

  return `You are organising quest threads for ${characterName}'s RPG journal into a BG3-style quest hierarchy.

IMPORTANT: The player character's name is ${characterName}.
Never refer to them as "the narrator", "the character", "the journal writer" or any other generic term.
Always use ${characterName} when referring to the player character.

EXISTING THREADS:
${threadsBlock}

ALL JOURNAL ENTRIES (chronological):
${formatEntries(entries)}

Group threads that share the same antagonist, location, cause or overarching goal into parent quests.
Think like BG3: "The Hunt for Severin" would be a parent with child threads about his location,
the assassin he sent, and the black blood plot he's behind.

STRICT RULES:
- Only group threads if their connection is EXPLICITLY stated in the journal entries
- Do NOT infer connections based on proximity in time or general RPG logic
- Do NOT assume NPCs are related to each other unless an entry explicitly states it
- If you are uncertain whether two threads are connected, do NOT group them
- Never add information not present in the entries
- Create parent threads only when 2+ children clearly belong together
- Only use thread IDs from the list above

Return ONLY valid JSON:
{
  "parent_groups": [
    {
      "parent_title": "The Hunt for Severin",
      "parent_summary": "one sentence overarching goal",
      "parent_urgency": "urgent|normal",
      "child_thread_ids": ["uuid1", "uuid2"]
    }
  ]
}
Return ONLY valid JSON, no markdown.`
}

function buildPhase3LitePrompt(
  characterName: string,
  newThread: { id: string; title: string; summary: string },
  existingParents: AnyRec[],
): string {
  const parentsBlock = existingParents
    .map((p: AnyRec) => `[${p.id}] "${p.title}" — ${p.summary ?? ''}`)
    .join('\n')

  return `Given this new thread and existing parent quests, does this thread belong under one of the parents?

Character: ${characterName}
New thread: "${newThread.title}" — ${newThread.summary}

Existing parents:
${parentsBlock}

Return ONLY JSON:
{
  "parent_id": "uuid of matching parent, or null if no match",
  "confidence": "high|low"
}

CRITICAL RULES:
- Only match if the connection is EXPLICIT and CERTAIN in the journal entries
- If uncertain, return null — do not guess
- ${characterName} is the player character — never say "narrator" or "character"
Return ONLY valid JSON, no markdown.`
}

function buildPhase3RegroupPrompt(
  characterName: string,
  orphans: AnyRec[],
  existingParents: AnyRec[],
  entries: AnyRec[],
): string {
  const orphansBlock = orphans
    .map((t: AnyRec) => `[${t.id}] "${t.title}" — ${t.summary ?? ''}`)
    .join('\n')
  const parentsBlock = existingParents.length > 0
    ? existingParents.map((t: AnyRec) => `[${t.id}] "${t.title}" — ${t.summary ?? ''}`).join('\n')
    : 'None.'

  return `You are regrouping orphaned quest threads for ${characterName}'s RPG journal.

IMPORTANT: The player character's name is ${characterName}.
Never refer to them as "the narrator", "the character", "the journal writer" or any other generic term.
Always use ${characterName} when referring to the player character.

ORPHANED THREADS (no parent yet — only these may be grouped or attached):
${orphansBlock}

EXISTING PARENT THREADS (do not modify — only attach orphans if clearly related):
${parentsBlock}

ALL JOURNAL ENTRIES (chronological):
${formatEntries(entries)}

Tasks:
1. Group orphans together under a NEW parent if 2+ orphans share the same overarching quest
2. Attach an orphan to an EXISTING parent if it clearly belongs there

STRICT RULES:
- Only group/attach if the connection is EXPLICITLY stated in the journal entries
- Do NOT infer connections not stated in the entries
- NEVER delete or modify existing parent threads
- NEVER detach existing children
- If uncertain, leave the orphan ungrouped
- Only use IDs from the lists above

Return ONLY valid JSON:
{
  "parent_groups": [
    {
      "parent_title": "New Quest Name",
      "parent_summary": "one sentence overarching goal",
      "parent_urgency": "urgent|normal",
      "child_thread_ids": ["orphan-uuid-1", "orphan-uuid-2"]
    }
  ],
  "attach_to_existing": [
    {
      "parent_id": "existing-parent-uuid",
      "child_thread_ids": ["orphan-uuid"]
    }
  ]
}
Return ONLY valid JSON, no markdown.`
}
