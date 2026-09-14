import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as rawClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

const admin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — all conversations for this player, ordered by updated_at desc, with message counts
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: conversations, error } = await (admin.from('lucien_conversations') as AnyRec)
      .select('id, title, updated_at')
      .eq('player_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!conversations?.length) return NextResponse.json({ conversations: [] })

    const conversationIds = conversations.map((c: AnyRec) => c.id as string)
    const { data: messagesData } = await (admin.from('lucien_messages') as AnyRec)
      .select('id, conversation_id')
      .in('conversation_id', conversationIds)

    const countByConversation = new Map<string, number>()
    for (const m of (messagesData ?? [])) {
      countByConversation.set(m.conversation_id, (countByConversation.get(m.conversation_id) ?? 0) + 1)
    }

    return NextResponse.json({
      conversations: conversations.map((c: AnyRec) => ({
        id: c.id,
        title: c.title,
        updated_at: c.updated_at,
        message_count: countByConversation.get(c.id) ?? 0,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// POST — create a new conversation
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await (admin.from('lucien_conversations') as AnyRec)
      .insert({ player_id: user.id })
      .select('id, title')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: data.id, title: data.title })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
