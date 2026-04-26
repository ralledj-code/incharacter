import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // Verify caller is an admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: callerProfile } = await (supabase.from('profiles') as any)
    .select('role').eq('id', user.id).single()
  if ((callerProfile as { role: string } | null)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId, role } = await req.json()
  if (!userId || !['player', 'dm', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const service = await createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (service.from('profiles') as any)
    .update({ role })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
