import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// POST — delete all sessions (entries cascade) and clear campaign_name
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: sessErr } = await supabaseAdmin
      .from('sessions')
      .delete()
      .eq('player_id', user.id)

    if (sessErr) return NextResponse.json({ error: sessErr.message }, { status: 500 })

    // Clear character-specific data only — never touch api_key_encrypted
    await supabaseAdmin
      .from('profiles')
      .update({ campaign_name: null, character_note: null })
      .eq('id', user.id)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
