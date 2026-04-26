import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

export async function POST(req: NextRequest) {
  try {
    const { campaignId, emails } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = await createServiceClient()
    const db = (t: string) => (service.from(t) as AnyRecord)

    // Get campaign name and code for the invite email
    const { data: campaign } = await db('campaigns')
      .select('name, campaign_code')
      .eq('id', campaignId)
      .eq('dm_id', user.id)
      .single()

    if (!campaign) return NextResponse.json({ error: 'Campaign not found or access denied' }, { status: 403 })

    const campaignName = (campaign as AnyRecord).name || 'a campaign'
    const campaignCode = (campaign as AnyRecord).campaign_code || ''
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://incharacter.cloud'

    // Build a regular signup link — player signs up with password, then enters campaign code
    const signupLink = `${siteUrl}/auth/login?role=player&campaign=${encodeURIComponent(campaignCode)}`

    const results = await Promise.allSettled(
      (emails as string[]).map(async (email: string) => {
        if (!email.trim()) return

        // Send plain invitation email via Resend — NO magic link, NO Supabase auth invite
        if (process.env.RESEND_API_KEY) {
          const resend = new Resend(process.env.RESEND_API_KEY)
          await resend.emails.send({
            from: 'In Character <noreply@incharacter.cloud>',
            to: email.trim().toLowerCase(),
            subject: `You've been invited to join ${campaignName} on In Character`,
            text: [
              `You've been invited to join ${campaignName} on In Character.`,
              '',
              'In Character is a psychological companion for tabletop RPG players. Your DM uses it to track character arcs across sessions.',
              '',
              'Click below to create your account:',
              signupLink,
              '',
              `During setup, enter your campaign code: ${campaignCode}`,
              '',
              'If you already have an account, sign in and enter the campaign code in Settings.',
            ].join('\n'),
            html: `
              <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
                <h2 style="font-family: 'Cinzel', serif; color: #c9a84c; margin-bottom: 8px;">In Character</h2>
                <p style="margin-bottom: 16px;">You&rsquo;ve been invited to join <strong>${campaignName}</strong>.</p>
                <p style="color: #4a4a4a; margin-bottom: 24px;">In Character is a psychological companion for tabletop RPG players. Your DM uses it to track character arcs across sessions.</p>
                <a href="${signupLink}" style="display: inline-block; background: #c9a84c; color: #fff; padding: 12px 28px; text-decoration: none; font-family: serif; border-radius: 2px; margin-bottom: 24px;">
                  Create Your Account →
                </a>
                <p style="color: #4a4a4a; font-size: 14px;">During setup, enter your campaign code: <strong>${campaignCode}</strong></p>
                <p style="color: #8a8a8a; font-size: 13px;">If you already have an account, sign in and enter the campaign code in Settings.</p>
              </div>
            `,
          })
        } else {
          // Fallback: log to console in development
          console.log('[invite]', { email, campaignName, campaignCode, signupLink })
        }

        // If user already exists, add them to campaign_members
        const { data: users } = await service.auth.admin.listUsers()
        const existingUser = users?.users?.find((u: AnyRecord) => u.email?.toLowerCase() === email.trim().toLowerCase())
        if (existingUser) {
          await db('campaign_members').upsert({
            campaign_id: campaignId,
            player_id: existingUser.id,
            accepted: false,
          }, { onConflict: 'campaign_id,player_id' })
        }
      })
    )

    const failed = results.filter(r => r.status === 'rejected').length
    return NextResponse.json({ sent: (emails as string[]).filter(e => e.trim()).length - failed, failed })
  } catch (error) {
    console.error('[dm/invite]', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
