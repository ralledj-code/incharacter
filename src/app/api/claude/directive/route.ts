import { NextRequest, NextResponse } from 'next/server'
import { generatePlayDirective } from '@/lib/api'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedApiKey } from '@/lib/getApiKey'
import { createClient as rawClient } from '@supabase/supabase-js'

// Admin client for writing dm_read without RLS
const admin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const apiKey = body.characterId
      ? await getDecryptedApiKey(user.id, body.characterId)
      : undefined

    // FIX 3: now returns { directive, dmRead }
    const result = await generatePlayDirective({
      characterName: body.characterName,
      dossierSummary: body.dossierSummary || '',
      trackers: body.trackers,
      recentEvents: body.recentEvents,
      trackerNames: body.trackerNames,
      dominantState: body.dominantState,
      previousDirective: body.previousDirective,
      apiKey: apiKey ?? undefined,
      userId: user.id,
      characterId: body.characterId,
    })

    // Store dm_read on characters table so DM dashboard can read it without API calls
    if (body.characterId && result.dmRead) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin.from('characters') as any)
        .update({ dm_read: result.dmRead })
        .eq('id', body.characterId)
        .eq('player_id', user.id)
    }

    return NextResponse.json({ directive: result.directive, dmRead: result.dmRead })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
