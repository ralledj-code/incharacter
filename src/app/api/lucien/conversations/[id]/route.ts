import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as rawClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

const admin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — full conversation with all messages, ordered by created_at asc
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const { data: conversation, error: convError } = await (admin.from('lucien_conversations') as AnyRec)
      .select('id, title, updated_at')
      .eq('id', id)
      .eq('player_id', user.id)
      .single()
    if (convError || !conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

    const { data: messages } = await (admin.from('lucien_messages') as AnyRec)
      .select('id, role, content, created_at')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })

    return NextResponse.json({ conversation, messages: messages ?? [] })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// DELETE — delete conversation and all messages (cascade)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const { error } = await (admin.from('lucien_conversations') as AnyRec)
      .delete()
      .eq('id', id)
      .eq('player_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
