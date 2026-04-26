import { NextRequest, NextResponse } from 'next/server'
import { generateEventNarrative } from '@/lib/api'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const narrative = await generateEventNarrative({
      characterName: body.characterName,
      dossierSummary: body.dossierSummary || '',
      trackers: body.trackers,
      category: body.category,
      subcategory: body.subcategory,
      reaction: body.reaction,
      apiKey: body.apiKey,
      userId: user?.id,
      characterId: body.characterId,
    })

    return NextResponse.json({ narrative })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
