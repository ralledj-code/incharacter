import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { campaignId, input } = await req.json()
    if (!campaignId || !input?.trim()) return NextResponse.json({ error: 'campaignId and input required' }, { status: 400 })

    const service = await createServiceClient()
    const db = (t: string) => (service.from(t) as R)

    // Verify DM owns this campaign
    const { data: camp } = await db('campaigns').select('id, name').eq('id', campaignId).eq('dm_id', user.id).limit(1)
    if (!camp?.length) return NextResponse.json({ error: 'Campaign not found or access denied' }, { status: 403 })
    const campaignName: string = camp[0].name

    const normalizedInput = input.trim()
    const inputUpper = normalizedInput.toUpperCase()
    const isCode = /^IC-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(inputUpper)

    let playerId: string | null = null
    let playerName: string | null = null

    if (isCode) {
      // Step 1: find the player by IC code
      console.log('[add-player] step1 IC code lookup:', inputUpper)
      const { data: profiles, error: e1 } = await db('profiles')
        .select('id, username')
        .filter('player_code', 'ilike', inputUpper)
        .limit(1)
      console.log('[add-player] step1 result:', { profiles, e1 })

      if (e1) return NextResponse.json({ error: `Step 1 error: ${e1.message}` }, { status: 500 })
      if (!profiles?.length) return NextResponse.json({ error: `No player found with code ${inputUpper}.` }, { status: 404 })

      playerId = profiles[0].id
      playerName = profiles[0].username
    } else {
      // Step 1: find the player by email via auth admin
      console.log('[add-player] step1 email lookup:', normalizedInput)
      const { data: { users }, error: listErr } = await service.auth.admin.listUsers()
      console.log('[add-player] step1 listUsers error:', listErr)

      if (listErr) return NextResponse.json({ error: 'Failed to look up by email.' }, { status: 500 })

      const authUser = users?.find((u: R) => u.email?.toLowerCase().trim() === normalizedInput.toLowerCase())
      console.log('[add-player] step1 auth user:', authUser?.id)
      if (!authUser) return NextResponse.json({ error: `No account found with email ${normalizedInput}.` }, { status: 404 })

      const { data: profiles } = await db('profiles').select('id, username').eq('id', authUser.id).limit(1)
      if (!profiles?.length) return NextResponse.json({ error: 'Player has not completed onboarding.' }, { status: 404 })

      playerId = profiles[0].id
      playerName = profiles[0].username
    }

    // Step 2: insert member row
    console.log('[add-player] step2 insert member:', { campaignId, playerId })
    const { error: e2 } = await db('campaign_members').insert({
      campaign_id: campaignId,
      player_id: playerId,
      accepted: true,
      invited_at: new Date().toISOString(),
    })
    console.log('[add-player] step2 result:', { e2 })

    if (e2) {
      if (e2.code === '23505') return NextResponse.json({ error: `${playerName || 'Player'} is already in this campaign.` }, { status: 409 })
      return NextResponse.json({ error: `Step 2 error: ${e2.message}` }, { status: 500 })
    }

    // Step 3: update character
    console.log('[add-player] step3 update character for player:', playerId)
    const { error: e3 } = await db('characters')
      .update({ campaign_id: campaignId })
      .eq('player_id', playerId)
    console.log('[add-player] step3 result:', { e3 })
    if (e3) console.error('[add-player] step3 non-fatal error:', e3.message)

    return NextResponse.json({ success: true, playerName: playerName || 'Player', campaignName, message: `${playerName || 'Player'} added to ${campaignName}.` })
  } catch (err) {
    console.error('[add-player] exception:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
