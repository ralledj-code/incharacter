import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptApiKey } from '@/lib/keyEncryption'

export async function POST(req: NextRequest) {
  try {
    const { campaignId, apiKey } = await req.json()
    if (!campaignId || !apiKey) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    if (!String(apiKey).startsWith('sk-ant-')) {
      return NextResponse.json({ error: 'Invalid key format' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const encrypted = encryptApiKey(String(apiKey).trim())

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('campaigns') as any)
      .update({ dm_api_key_encrypted: encrypted })
      .eq('id', campaignId)
      .eq('dm_id', user.id) // ownership enforced

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[dm/update-key] error storing key')
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
