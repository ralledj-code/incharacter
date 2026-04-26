import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json()
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'In Character <noreply@incharacter.cloud>',
        to: 'ralledj@gmail.com',
        subject: `In Character contact: ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      })
    } else {
      // Fallback: log to console in development
      console.log('[contact]', { name, email, message })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[contact]', error)
    return NextResponse.json({ error: 'Send failed' }, { status: 500 })
  }
}
