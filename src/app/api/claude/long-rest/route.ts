import { NextRequest, NextResponse } from 'next/server'
import { generateLongRestMonologue } from '@/lib/api'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedApiKey } from '@/lib/getApiKey'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const apiKey = body.characterId
      ? await getDecryptedApiKey(user.id, body.characterId)
      : undefined

    const monologue = await generateLongRestMonologue({
      characterName: body.characterName,
      dossierSummary: body.dossierSummary || '',
      trackers: body.trackers,
      drank: body.drank,
      dreamed: body.dreamed,
      apiKey: apiKey ?? undefined,
      userId: user.id,
      characterId: body.characterId,
    })

    return NextResponse.json({ monologue })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
