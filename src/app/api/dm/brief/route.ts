import { NextRequest, NextResponse } from 'next/server'
import { generateDMPartyBrief } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const brief = await generateDMPartyBrief({
      campaignName: body.campaignName,
      characters: body.characters,
    })
    return NextResponse.json({ brief })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
