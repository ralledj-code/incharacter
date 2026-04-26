import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const campaignId = req.nextUrl.searchParams.get('campaignId')
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!campaignId) return NextResponse.json({ error: 'campaignId required' }, { status: 400 })

  const db = (t: string) => (supabase.from(t) as AnyRecord)
  let query = db('dm_session_notes').select('*').eq('campaign_id', campaignId).eq('dm_id', user.id)
  if (sessionId) query = query.eq('session_id', sessionId)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ notes: data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { campaignId, sessionId, notes } = await req.json()
  if (!campaignId || !notes) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const db = (t: string) => (supabase.from(t) as AnyRecord)

  // Check DM owns this campaign
  const { data: campaign } = await db('campaigns').select('id').eq('id', campaignId).eq('dm_id', user.id).single()
  if (!campaign) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await db('dm_session_notes').upsert({
    campaign_id: campaignId,
    session_id: sessionId || null,
    dm_id: user.id,
    notes,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'campaign_id,dm_id,session_id' }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ note: data })
}
