import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as rawClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

const admin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// PATCH — update entry (text, icon, category, pinned)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const updates: AnyRec = { updated_at: new Date().toISOString() }

    if (body.text !== undefined) updates.text = body.text
    if (body.icon !== undefined) updates.icon = body.icon
    if (body.category !== undefined) updates.category = body.category
    if (body.pinned !== undefined) updates.pinned = body.pinned

    const { data, error } = await (admin.from('entries') as AnyRec)
      .update(updates)
      .eq('id', id)
      .eq('player_id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ entry: data })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// DELETE — delete entry
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const { error } = await (admin.from('entries') as AnyRec)
      .delete()
      .eq('id', id)
      .eq('player_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Clean up quest threads that opened on this entry
    const { data: affectedThreads } = await (admin.from('quest_threads') as AnyRec)
      .select('id')
      .eq('first_entry_id', id)
      .eq('player_id', user.id)

    for (const thread of (affectedThreads ?? [])) {
      const { count } = await (admin.from('quest_thread_updates') as AnyRec)
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', thread.id)
      if ((count ?? 0) <= 1) {
        await (admin.from('quest_threads') as AnyRec)
          .delete()
          .eq('id', thread.id)
          .eq('player_id', user.id)
      } else {
        await (admin.from('quest_threads') as AnyRec)
          .update({ first_entry_id: null })
          .eq('id', thread.id)
          .eq('player_id', user.id)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
