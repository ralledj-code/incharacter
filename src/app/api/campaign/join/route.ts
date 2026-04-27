import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { code } = await req.json()
    if (!code) return NextResponse.json({ error: 'Campaign code required' }, { status: 400 })

    // FIX 2 Path A: use service role to bypass campaigns RLS
    // Use UPPER(TRIM()) on both sides to handle case/whitespace
    const service = await createServiceClient()
    const db = (t: string) => (service.from(t) as AnyRec)

    const normalizedCode = code.trim().toUpperCase()
    console.log('[campaign/join] looking up code:', normalizedCode)

    // Path A: look up campaign using service role (bypasses RLS)
    const { data: campaigns, error: campErr } = await db('campaigns')
      .select('id, name, campaign_code')
      .eq('campaign_code', normalizedCode)
      .limit(1)

    console.log('[campaign/join] campaign lookup:', { campaigns, campErr })

    if (campErr) {
      console.error('[campaign/join] campaign lookup error:', campErr)
      return NextResponse.json({ error: `Database error: ${campErr.message}` }, { status: 500 })
    }

    const campaign = campaigns?.[0]
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found. Check the code and try again.' }, { status: 404 })
    }
    const campaignId = (campaign as AnyRec).id
    const campaignName = (campaign as AnyRec).name

    // Check already a member
    const { data: existing } = await db('campaign_members')
      .select('player_id')
      .eq('campaign_id', campaignId)
      .eq('player_id', user.id)
      .limit(1)

    if (existing?.[0]) {
      return NextResponse.json({ error: `Already a member of ${campaignName}.` }, { status: 409 })
    }

    // FIX 2 Path C: find character using service role + limit(1) not single()
    const { data: characters, error: charLookupErr } = await db('characters')
      .select('id')
      .eq('player_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    console.log('[campaign/join] character lookup:', { characters, charLookupErr })

    const character = characters?.[0]
    if (!character) {
      return NextResponse.json({ error: 'No character found. Please complete onboarding first.' }, { status: 404 })
    }
    const characterId = (character as AnyRec).id

    // Insert campaign_members with ON CONFLICT DO NOTHING
    const { error: memberErr } = await db('campaign_members').upsert(
      {
        campaign_id: campaignId,
        player_id: user.id,
        accepted: true,
        invited_at: new Date().toISOString(),
      },
      { onConflict: 'campaign_id,player_id' }
    )
    if (memberErr) {
      console.error('[campaign/join] member insert error:', memberErr)
      return NextResponse.json({ error: `Failed to join: ${memberErr.message}` }, { status: 500 })
    }

    // Update character.campaign_id
    const { error: charUpdateErr } = await db('characters')
      .update({ campaign_id: campaignId })
      .eq('id', characterId)
      .eq('player_id', user.id)

    if (charUpdateErr) {
      console.error('[campaign/join] character update error:', charUpdateErr)
      // Non-fatal — campaign_members row is what matters for DM dashboard
    }

    console.log('[campaign/join] success:', { userId: user.id, campaignId, campaignName })
    return NextResponse.json({
      success: true,
      campaignName,
      message: `Joined ${campaignName}!`,
    })
  } catch (error) {
    console.error('[campaign/join] exception:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
