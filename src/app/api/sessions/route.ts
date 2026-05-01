import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as rawClient } from '@supabase/supabase-js'
import type { Entry } from '@/types/database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

const admin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — fetch active + past sessions and dm_email for the current user
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    function sortEntries(entries: Entry[]): Entry[] {
      return [...(entries || [])].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    }

    const [{ data: activeSessions }, { data: pastSessionsRaw }, { data: profile }] = await Promise.all([
      (admin.from('sessions') as AnyRec)
        .select('*, entries(*)')
        .eq('player_id', user.id)
        .is('ended_at', null)
        .order('created_at', { ascending: false })
        .limit(1),
      (admin.from('sessions') as AnyRec)
        .select('*, entries(*)')
        .eq('player_id', user.id)
        .not('ended_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50),
      (admin.from('profiles') as AnyRec)
        .select('dm_email, campaign_name')
        .eq('id', user.id)
        .single(),
    ])

    const activeSession = activeSessions?.[0]
      ? { ...activeSessions[0], entries: sortEntries(activeSessions[0].entries || []) }
      : null

    const pastSessions = (pastSessionsRaw || []).map((s: AnyRec) => ({
      ...s,
      entries: sortEntries(s.entries || []),
    }))

    return NextResponse.json({
      activeSession,
      pastSessions,
      dmEmail: profile?.dm_email || null,
      campaignName: profile?.campaign_name || null,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// POST — create a new session
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, character_name } = await req.json()

    const { data, error } = await (admin.from('sessions') as AnyRec)
      .insert({ player_id: user.id, title: title || null, character_name: character_name || null })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ session: data })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
