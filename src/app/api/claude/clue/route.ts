import { NextRequest, NextResponse } from 'next/server'
import { generateClueNarrative } from '@/lib/api'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const result = await generateClueNarrative({
      characterName: body.characterName,
      dossierSummary: body.dossierSummary || '',
      sourceType: body.sourceType,
      rawText: body.rawText,
      existingBelief: body.existingBelief,
      apiKey: body.apiKey,
      userId: user?.id,
      characterId: body.characterId,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
