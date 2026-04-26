import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptApiKey } from '@/lib/keyEncryption'

export async function POST(req: NextRequest) {
  try {
    const { characterId, apiKey } = await req.json()

    if (!characterId || !apiKey) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Basic format validation — must start with sk-ant-
    if (!String(apiKey).startsWith('sk-ant-')) {
      return NextResponse.json({ error: 'Invalid key format' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Encrypt server-side — plaintext key never written anywhere
    const encrypted = encryptApiKey(String(apiKey).trim())

    // Verify user owns this character before writing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('characters') as any)
      .update({ api_key_encrypted: encrypted })
      .eq('id', characterId)
      .eq('player_id', user.id) // ownership enforced via JWT

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Never echo the key or encrypted blob back
    return NextResponse.json({ ok: true })
  } catch (error) {
    // Never log the key in error messages
    console.error('[update-key] error storing key')
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
