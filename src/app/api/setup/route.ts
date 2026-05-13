import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptApiKey } from '@/lib/keyEncryption'
import { createClient as rawClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

const admin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — returns whether the user has an API key saved
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data } = await (admin.from('profiles') as AnyRec)
      .select('api_key_encrypted')
      .eq('id', user.id)
      .single()

    const hasKey = !!(data as { api_key_encrypted?: string } | null)?.api_key_encrypted
    return NextResponse.json({ hasKey })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// POST — save character_name + api_key (and optionally character_note, color_scheme)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const updates: AnyRec = {}

    if (body.character_name !== undefined) updates.character_name = body.character_name
    if (body.character_note !== undefined) updates.character_note = body.character_note
    if (body.color_scheme !== undefined) updates.color_scheme = body.color_scheme
    if (body.campaign_name !== undefined) updates.campaign_name = body.campaign_name
    if (body.dm_email !== undefined) updates.dm_email = body.dm_email || null
    if (body.api_key) updates.api_key_encrypted = encryptApiKey(body.api_key)

    const { error } = await (admin.from('profiles') as AnyRec)
      .update(updates)
      .eq('id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// POST /api/setup/test — validate API key works
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { api_key } = await req.json()
    if (!api_key) return NextResponse.json({ error: 'No key provided' }, { status: 400 })

    const client = new Anthropic({ apiKey: api_key })
    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'hi' }],
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 400 })
  }
}
