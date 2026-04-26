import { NextRequest, NextResponse } from 'next/server'
import { analyzeDossier } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await analyzeDossier({
      dossierText: body.dossierText,
      apiKey: body.apiKey,
    })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
