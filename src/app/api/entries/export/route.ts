import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as rawClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

const admin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('en-GB', { timeZone: 'Europe/Copenhagen', dateStyle: 'medium', timeStyle: 'short' }) : ''

// GET — every session of the current user with all its events (entries), oldest first, as a downloadable text file
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [{ data: sessions, error }, { data: profile }] = await Promise.all([
      (admin.from('sessions') as AnyRec)
        .select('*, entries(*)')
        .eq('player_id', user.id)
        .order('created_at', { ascending: true }),
      (admin.from('profiles') as AnyRec)
        .select('character_name, campaign_name')
        .eq('id', user.id)
        .single(),
    ])
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const all = (sessions || []) as AnyRec[]
    const total = all.reduce((n, s) => n + (s.entries?.length || 0), 0)
    const out: string[] = []
    out.push(`InCharacter: all events${profile?.character_name ? ` of ${profile.character_name}` : ''}${profile?.campaign_name ? ` (${profile.campaign_name})` : ''}`)
    out.push(`Exported ${fmt(new Date().toISOString())} · ${all.length} sessions · ${total} events`)
    out.push('')

    all.forEach((s, i) => {
      out.push('='.repeat(72))
      out.push(`Session ${i + 1}${s.title ? `: ${s.title}` : ''}`)
      out.push(`${fmt(s.created_at)}${s.ended_at ? ` to ${fmt(s.ended_at)}` : ' (still open)'}`)
      if (s.summary) { out.push(''); out.push('Summary:'); out.push(String(s.summary).trim()) }
      out.push('')
      const entries = [...(s.entries || [])].sort((a: AnyRec, b: AnyRec) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      if (!entries.length) out.push('(no events)')
      entries.forEach((e: AnyRec) => {
        const time = new Date(e.created_at).toLocaleTimeString('en-GB', { timeZone: 'Europe/Copenhagen', hour: '2-digit', minute: '2-digit' })
        const tags = [e.category, e.pinned ? 'pinned' : null].filter(Boolean).join(', ')
        out.push(`[${time}]${tags ? ` (${tags})` : ''} ${String(e.text || '').trim()}`)
      })
      out.push('')
    })

    const date = new Date().toISOString().slice(0, 10)
    return new NextResponse(out.join('\n'), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="incharacter-events-${date}.txt"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
