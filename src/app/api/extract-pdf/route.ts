import { NextRequest, NextResponse } from 'next/server'
import { extractText as extractPdfText } from 'unpdf'
// mammoth is CJS — require avoids ESM interop issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require('mammoth')

function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[^\x09\x0A\x0D\x20-\x7E -￿]/g, '')
    .trim()
    .slice(0, 50000)
}

async function extractFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.pdf')) {
    try {
      const uint8 = new Uint8Array(buffer)
      const { text } = await extractPdfText(uint8, { mergePages: true })
      return text || ''
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

  // Unknown type — try plain text
  return buffer.toString('utf-8')
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ text: '' })

    const raw = await extractFromFile(file)
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
