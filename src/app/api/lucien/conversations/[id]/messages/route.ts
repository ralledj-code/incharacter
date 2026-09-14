import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as rawClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

const admin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// DELETE — clear all messages from a conversation, keep the conversation record.
// Used by the End Session flow to let the player start fresh while keeping the thread title.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const { data: conversation } = await (admin.from('lucien_conversations') as AnyRec)
      .select('id')
      .eq('id', id)
      .eq('player_id', user.id)
      .single()
    if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

    const { error } = await (admin.from('lucien_messages') as AnyRec)
      .delete()
      .eq('conversation_id', id)
      .eq('player_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
