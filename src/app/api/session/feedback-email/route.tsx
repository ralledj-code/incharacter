import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as rawClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { SessionFeedbackEmail } from '@/emails/SessionFeedbackEmail'
import type { FeedbackData } from '@/types/database'
import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

const admin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { sessionId } = await req.json()
    if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })

    const [{ data: session }, { data: profile }, { data: entriesRaw }] = await Promise.all([
      (admin.from('sessions') as AnyRec)
        .select('id, title, summary, feedback, created_at')
        .eq('id', sessionId)
        .eq('player_id', user.id)
        .single(),
      (admin.from('profiles') as AnyRec)
        .select('character_name, dm_email')
        .eq('id', user.id)
        .single(),
      (admin.from('entries') as AnyRec)
        .select('text, icon, category')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true }),
    ])

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const dmEmail: string | null = profile?.dm_email
    if (!dmEmail) return NextResponse.json({ error: 'No DM email set' }, { status: 400 })

    const feedback = session.feedback as FeedbackData | null
    if (!feedback) return NextResponse.json({ error: 'No feedback on session' }, { status: 400 })

    const characterName: string = profile?.character_name || 'Unknown Character'
    const playerEmail: string = user.email || ''
    const sessionDate = new Date(session.created_at).toLocaleDateString([], {
      month: 'short', day: 'numeric', year: 'numeric',
    })
    const entries: Array<{ text: string; icon: string | null; category: string | null }> =
      (entriesRaw || []).map((e: AnyRec) => ({ text: e.text, icon: e.icon || null, category: e.category || null }))

    const html = await render(
      React.createElement(SessionFeedbackEmail, {
        characterName,
        campaignName: session.title || 'Session',
        sessionDate,
        summary: session.summary || '',
        playerEmail,
        playerName: characterName,
        feedback,
        entries,
      })
    )

    if (!process.env.RESEND_API_KEY) {
      console.log('[feedback-email] no RESEND_API_KEY — skipping send')
      return NextResponse.json({ ok: true })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'In Character <noreply@incharacter.cloud>',
      to: dmEmail,
      replyTo: playerEmail || undefined,
      subject: `${characterName} — Session notes, ${sessionDate}`,
      html,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[feedback-email]', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
