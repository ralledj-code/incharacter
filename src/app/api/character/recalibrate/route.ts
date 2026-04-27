import { NextResponse } from 'next/server'

export async function POST() {
  console.log('RECALIBRATE REACHED')
  return NextResponse.json({ ok: true })
}
