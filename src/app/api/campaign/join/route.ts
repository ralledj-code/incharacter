import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAnonClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>

// True service role client — bypasses RLS entirely, no session inheritance
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // Auth check only — anon client reads the user's JWT from cookies
    const anonClient = await createAnonClient()
    const { data: { user } } = await anonClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { code } = await req.json()
    if (!code?.trim()) return NextResponse.json({ error: 'Campaign code required' }, { status: 400 })

    const normalizedCode = code.trim().toUpperCase()

    // Step 1: find the campaign — admin client, no RLS
    console.log('[join] step1 lookup code:', normalizedCode)
    const { data: found, error: e1 } = await (admin.from('campaigns') as R)
      .select('id, name')
      .filter('campaign_code', 'ilike', normalizedCode)
      .limit(1)
    console.log('[join] step1 result:', { found, e1 })

    if (e1) return NextResponse.json({ error: `Step 1 error: ${e1.message}` }, { status: 500 })
    if (!found?.length) return NextResponse.json({ error: 'Campaign not found. Check the code and try again.' }, { status: 404 })

    const campaignId: string = found[0].id
    const campaignName: string = found[0].name

    // Step 2: insert member row — admin client
    console.log('[join] step2 insert member:', { campaignId, userId: user.id })
    const { error: e2 } = await (admin.from('campaign_members') as R).insert({
      campaign_id: campaignId,
      player_id: user.id,
      accepted: true,
      invited_at: new Date().toISOString(),
    })
    console.log('[join] step2 result:', { e2 })

    if (e2) {
      if (e2.code === '23505') return NextResponse.json({ error: 'Already in campaign.' }, { status: 409 })
      return NextResponse.json({ error: `Step 2 error: ${e2.message}` }, { status: 500 })
    }

    // Step 3: update character — admin client
    console.log('[join] step3 update character for player:', user.id)
    const { error: e3 } = await (admin.from('characters') as R)
      .update({ campaign_id: campaignId })
      .eq('player_id', user.id)
    console.log('[join] step3 result:', { e3 })
    if (e3) console.error('[join] step3 non-fatal error:', e3.message)

    return NextResponse.json({ success: true, campaignName, message: `Joined ${campaignName}!` })
  } catch (err) {
    console.error('[join] exception:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
