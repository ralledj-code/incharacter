import { NextRequest, NextResponse } from 'next/server'
import { generatePlayDirective } from '@/lib/api'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const directive = await generatePlayDirective({
      characterName: body.characterName,
      dossierSummary: body.dossierSummary || '',
      trackers: body.trackers,
      recentEvents: body.recentEvents,
      apiKey: body.apiKey,
      userId: user?.id,
      characterId: body.characterId,
    })

    return NextResponse.json({ directive })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
