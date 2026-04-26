import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ text: '' })

    // For now, read as plain text (PDF binary won't parse well, but it's a fallback)
    // Real PDF parsing would need pdf-parse or similar
    const buffer = await file.arrayBuffer()
    const text = new TextDecoder('utf-8', { fatal: false }).decode(buffer)

    // Basic cleanup: remove null bytes and non-printable chars, keep readable text
    const cleaned = text
      .replace(/\x00/g, '')
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s{3,}/g, '\n\n')
      .trim()

    return NextResponse.json({ text: cleaned })
  } catch (error) {
    return NextResponse.json({ text: '', error: String(error) })
  }
}
