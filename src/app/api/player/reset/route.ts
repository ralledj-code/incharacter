import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as rawClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

const admin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST — delete all sessions (entries cascade) and clear campaign_name
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error: sessErr } = await (admin.from('sessions') as AnyRec)
      .delete()
      .eq('player_id', user.id)

    if (sessErr) return NextResponse.json({ error: sessErr.message }, { status: 500 })

    await (admin.from('profiles') as AnyRec)
      .update({ campaign_name: null })
      .eq('id', user.id)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
