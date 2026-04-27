import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { campaignId, input } = await req.json()
    if (!campaignId || !input?.trim()) {
      return NextResponse.json({ error: 'campaignId and input required' }, { status: 400 })
    }

    // Always use service role — bypasses all RLS
    const service = await createServiceClient()
    const db = (t: string) => (service.from(t) as AnyRec)

    // Verify the DM owns this campaign
    const { data: campaign } = await db('campaigns')
      .select('id, name')
      .eq('id', campaignId)
      .eq('dm_id', user.id)
      .limit(1)

    if (!campaign?.[0]) {
      return NextResponse.json({ error: 'Campaign not found or access denied' }, { status: 403 })
    }
    const campaignName = (campaign[0] as AnyRec).name

    const normalizedInput = input.trim()
    const isCode = /^IC-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(normalizedInput)
    const inputUpper = normalizedInput.toUpperCase()

    let playerId: string | null = null
    let playerName: string | null = null

    if (isCode) {
      // FIX 2 Path C: IC code lookup via service role + limit(1), not single()
      console.log('[dm/add-player] IC code lookup:', inputUpper)
      const { data: profiles, error: profErr } = await db('profiles')
        .select('id, username, player_code')
        .eq('player_code', inputUpper)
        .limit(1)

      console.log('[dm/add-player] profile lookup:', { profiles, profErr })

      if (profErr) {
        return NextResponse.json({ error: `Lookup error: ${profErr.message}` }, { status: 500 })
      }
      const prof = profiles?.[0]
      if (!prof) {
        return NextResponse.json({
          error: `No player found with code ${inputUpper}. Make sure they have completed onboarding.`,
        }, { status: 404 })
      }
      playerId = (prof as AnyRec).id
      playerName = (prof as AnyRec).username
    } else {
      // FIX 2 Path B: email lookup via service role auth admin
      console.log('[dm/add-player] email lookup:', normalizedInput)
      const { data: { users }, error: listErr } = await service.auth.admin.listUsers()
      if (listErr) {
        console.error('[dm/add-player] listUsers error:', listErr)
        return NextResponse.json({ error: 'Failed to look up player by email.' }, { status: 500 })
      }

      const authUser = users?.find((u: AnyRec) =>
        u.email?.toLowerCase().trim() === normalizedInput.toLowerCase()
      )
      console.log('[dm/add-player] auth user found:', authUser?.id)

      if (!authUser) {
        return NextResponse.json({
          error: `No account found with email ${normalizedInput}. Make sure they have signed up.`,
        }, { status: 404 })
      }

      const { data: profiles } = await db('profiles')
        .select('id, username')
        .eq('id', authUser.id)
        .limit(1)

      const prof = profiles?.[0]
      if (!prof) {
        return NextResponse.json({
          error: `Player found but has not completed onboarding.`,
        }, { status: 404 })
      }
      playerId = (prof as AnyRec).id
      playerName = (prof as AnyRec).username
    }

    if (!playerId) {
      return NextResponse.json({ error: 'Player not found.' }, { status: 404 })
    }

    // Check already a member
    const { data: existing } = await db('campaign_members')
      .select('player_id')
      .eq('campaign_id', campaignId)
      .eq('player_id', playerId)
      .limit(1)

    if (existing?.[0]) {
      return NextResponse.json({
        error: `${playerName || 'Player'} is already in this campaign.`,
      }, { status: 409 })
    }

    // Insert campaign_members
    const { error: memberErr } = await db('campaign_members').upsert(
      {
        campaign_id: campaignId,
        player_id: playerId,
        accepted: true,
        invited_at: new Date().toISOString(),
      },
      { onConflict: 'campaign_id,player_id' }
    )
    if (memberErr) {
      console.error('[dm/add-player] member insert error:', memberErr)
      return NextResponse.json({ error: memberErr.message }, { status: 500 })
    }

    // Also update their character.campaign_id using service role + limit(1)
    const { data: characters } = await db('characters')
      .select('id')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false })
      .limit(1)

    const character = characters?.[0]
    if (character) {
      await db('characters')
        .update({ campaign_id: campaignId })
        .eq('id', (character as AnyRec).id)
        .eq('player_id', playerId)
    }

    console.log('[dm/add-player] success:', { playerId, playerName, campaignId, campaignName })
    return NextResponse.json({
      success: true,
      playerName: playerName || 'Player',
      campaignName,
      message: `${playerName || 'Player'} added to ${campaignName}.`,
    })
  } catch (error) {
    console.error('[dm/add-player] exception:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
