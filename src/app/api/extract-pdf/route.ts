import { NextRequest, NextResponse } from 'next/server'

// CJS modules — require avoids ESM interop issues in Next.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require('mammoth')

function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    // Remove non-printable chars (keep tab, LF, CR, printable ASCII, and extended unicode)
    .replace(/[^\x09\x0A\x0D\x20-\x7E -￿]/g, '')
    .trim()
    .slice(0, 50000)
}

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.pdf')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await pdfParse(buffer)
      return data.text || ''
    } catch {
      throw new Error('Could not read PDF')
    }
  }

  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await mammoth.extractRawText({ buffer })
      return result.value || ''
    } catch {
      throw new Error('Could not read Word document')
    }
  }

  if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    return buffer.toString('utf-8')
  }

  // Fallback: try plain text decode for unknown types
  return buffer.toString('utf-8')
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ text: '' })

    const raw = await extractText(file)
    const cleaned = cleanText(raw)

    if (cleaned.length < 100) {
      return NextResponse.json({
        text: '',
        error: "Couldn't read that file. Try copying and pasting your dossier as text in the field below.",
      })
    }

    return NextResponse.json({ text: cleaned })
  } catch (error) {
    console.error('[extract-pdf]', error)
    return NextResponse.json({
      text: '',
      error: "Couldn't read that file. Try copying and pasting your dossier as text in the field below.",
    })
  }
}
