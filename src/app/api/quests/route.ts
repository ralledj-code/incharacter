import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as rawClient } from '@supabase/supabase-js'

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

    const { data: quests } = await (admin.from('quests') as AnyRec)
      .select('id, title, status, urgency, created_at, updated_at')
      .eq('player_id', user.id)
      .neq('status', 'dismissed')
      .order('updated_at', { ascending: false })

    if (!quests?.length) return NextResponse.json({ quests: [] })

    const questIds = quests.map((q: AnyRec) => q.id as string)

    const [{ data: updatesData }, { data: mapData }] = await Promise.all([
      (admin.from('quest_updates') as AnyRec)
        .select('id, quest_id, status_text, is_current, created_at')
        .in('quest_id', questIds)
        .order('created_at', { ascending: false }),
      (admin.from('entry_quest_map') as AnyRec)
        .select('entry_id, quest_id')
        .in('quest_id', questIds),
    ])

    const allEntryIds = (mapData ?? []).map((m: AnyRec) => m.entry_id as string)
    let entriesData: AnyRec[] = []
    if (allEntryIds.length > 0) {
      const { data } = await (admin.from('entries') as AnyRec)
        .select('id, text, icon, category, created_at')
        .in('id', allEntryIds)
      entriesData = data ?? []
    }

    const updatesByQuest = new Map<string, AnyRec[]>()
    for (const u of (updatesData ?? [])) {
      if (!updatesByQuest.has(u.quest_id)) updatesByQuest.set(u.quest_id, [])
      updatesByQuest.get(u.quest_id)!.push(u)
    }

    const entryIdToData = new Map(entriesData.map((e: AnyRec) => [e.id as string, e]))
    const entriesByQuest = new Map<string, AnyRec[]>()
    for (const m of (mapData ?? [])) {
      if (!entriesByQuest.has(m.quest_id)) entriesByQuest.set(m.quest_id, [])
      const entry = entryIdToData.get(m.entry_id)
      if (entry) entriesByQuest.get(m.quest_id)!.push(entry)
    }

    return NextResponse.json({
      quests: quests.map((q: AnyRec) => ({
        ...q,
        updates: updatesByQuest.get(q.id) ?? [],
        entries: entriesByQuest.get(q.id) ?? [],
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
