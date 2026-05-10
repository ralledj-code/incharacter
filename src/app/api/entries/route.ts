import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as rawClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

const admin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST — create an entry
export async function POST(req: NextRequest) {
  try {
    const cookieNames = req.cookies.getAll().map(c => c.name)
    console.log('[entries] cookies present:', cookieNames)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('[entries] getUser failed — error:', authError?.message, '| status:', authError?.status, '| cookies:', cookieNames)
      return NextResponse.json(
        { error: 'Unauthorized', detail: authError?.message ?? 'no user', status: authError?.status },
        { status: 401 }
      )
    }

    const { session_id, text } = await req.json()
    if (!session_id || !text?.trim()) {
      return NextResponse.json({ error: 'session_id and text are required' }, { status: 400 })
    }

    console.log('Saving entry:', { text: text.trim(), session_id, player_id: user.id })
    const { data, error } = await (admin.from('entries') as AnyRec)
      .insert({ session_id, player_id: user.id, text: text.trim() })
      .select('id')
      .single()

    if (error) {
      console.error('[entries] insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    console.log('[entries] inserted id:', data?.id)
    return NextResponse.json({ id: data?.id })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
