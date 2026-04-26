import { NextRequest, NextResponse } from 'next/server'
// pdf-parse is a CJS module; importing via require avoids ESM interop issues in Next.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse')

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ text: '' })

    if (file.type === 'application/pdf' || file.name?.endsWith('.pdf')) {
      const pdfBuffer = Buffer.from(await file.arrayBuffer())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfData: any = await pdfParse(pdfBuffer)
      const rawText: string = pdfData.text || ''

      const cleaned = rawText
        // Collapse runs of whitespace/newlines to at most two newlines
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        // Remove non-printable characters (keep normal ASCII + basic unicode)
        .replace(/[^\x09\x0A\x0D\x20-\x7E -￿]/g, '')
        .trim()
        .slice(0, 50000)

      if (cleaned.length < 100) {
        return NextResponse.json({
          text: '',
          error: "Couldn't read this PDF. Try copying and pasting your dossier as text instead.",
        })
      }

      return NextResponse.json({ text: cleaned })
    }

    // Plain text fallback
    const text = await file.text()
    return NextResponse.json({ text: text.slice(0, 50000) })
  } catch (error) {
    console.error('[extract-pdf]', error)
    return NextResponse.json({
      text: '',
      error: "Couldn't read this PDF. Try copying and pasting your dossier as text instead.",
    })
  }
}
