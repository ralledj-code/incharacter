import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = await createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (t: string) => (service.from(t) as any)

    // Log deletion
    await db('deletion_log').insert({
      deleted_by: user.id,
      target_type: 'account',
      target_id: user.id,
      target_email: user.email,
      reason: 'user_self_delete',
    })

    // Cascade: delete profile (FK cascades handle the rest)
    await db('profiles').delete().eq('id', user.id)

    // Delete auth user
    await service.auth.admin.deleteUser(user.id)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
