import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

export async function POST(req: NextRequest) {
  try {
    const { campaignId, emails } = await req.json()
    const supabase = await createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (t: string) => (supabase.from(t) as AnyRecord)

    const results = await Promise.allSettled(
      (emails as string[]).map(async (email: string) => {
        // Send magic link invite
        const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?role=player&campaign=${campaignId}`,
        })
        if (error) throw error

        // Get user if exists
        const { data: users } = await supabase.auth.admin.listUsers()
        const user = users?.users?.find((u: AnyRecord) => u.email === email)

        if (user) {
          await db('campaign_members').upsert({
            campaign_id: campaignId,
            player_id: user.id,
            accepted: false,
          })
        }
      })
    )

    const failed = results.filter(r => r.status === 'rejected').length
    return NextResponse.json({ sent: emails.length - failed, failed })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
