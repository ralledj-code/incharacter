import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as rawClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

const admin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// PATCH — update session (end it, add summary, update title)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const updates: AnyRec = {}

    if (body.ended_at !== undefined) updates.ended_at = body.ended_at
    if (body.summary !== undefined) updates.summary = body.summary
    if (body.title !== undefined) updates.title = body.title
    if (body.feedback !== undefined) updates.feedback = body.feedback

    const { data, error } = await (admin.from('sessions') as AnyRec)
      .update(updates)
      .eq('id', id)
      .eq('player_id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ session: data })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// DELETE — delete a session, but only if it has no entries
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const { count, error: countError } = await (admin.from('entries') as AnyRec)
      .select('id', { count: 'exact', head: true })
      .eq('session_id', id)
    if (countError) return NextResponse.json({ error: countError.message }, { status: 500 })
    if ((count ?? 0) > 0) {
      return NextResponse.json({ error: 'This session has entries and cannot be deleted.' }, { status: 400 })
    }

    const { error } = await (admin.from('sessions') as AnyRec)
      .delete()
      .eq('id', id)
      .eq('player_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
