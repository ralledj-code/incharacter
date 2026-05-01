import { createClient } from '@/lib/supabase/server'
import { createClient as rawClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import PlayApp from './PlayApp'
import type { SessionWithEntries, Entry } from '@/types/database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

const admin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function PlayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Check setup complete
  const { data: profile, error: profileErr } = await (admin.from('profiles') as AnyRec)
    .select('character_name, character_note, color_scheme, campaign_name, api_key_encrypted, dm_email')
    .eq('id', user.id)
    .single()

  console.log('SETUP CHECK:', {
    character_name: profile?.character_name,
    api_key: !!profile?.api_key_encrypted,
    profileErr: profileErr?.message ?? null,
  })

  // Only redirect when the profile row exists but the required fields are missing.
  // If the fetch itself failed (profileErr), don't redirect — it would loop.
  if (!profileErr && profile && (!profile.character_name || !profile.api_key_encrypted)) {
    redirect('/setup')
  }

  // Fetch active session (no ended_at) with entries
  const { data: activeSessions } = await (admin.from('sessions') as AnyRec)
    .select('*, entries(*)')
    .eq('player_id', user.id)
    .is('ended_at', null)
    .order('created_at', { ascending: false })
    .limit(1)

  // Fetch past sessions with entries
  const { data: pastSessionsRaw } = await (admin.from('sessions') as AnyRec)
    .select('*, entries(*)')
    .eq('player_id', user.id)
    .not('ended_at', 'is', null)
    .order('created_at', { ascending: false })
    .limit(50)

  function sortEntries(entries: Entry[]): Entry[] {
    return [...entries].sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  }

  const activeSession: SessionWithEntries | null = activeSessions?.[0]
    ? { ...activeSessions[0], entries: sortEntries(activeSessions[0].entries || []) }
    : null

  const pastSessions: SessionWithEntries[] = (pastSessionsRaw || []).map((s: AnyRec) => ({
    ...s,
    entries: sortEntries(s.entries || []),
  }))

  return (
    <PlayApp
      characterName={profile.character_name}
      campaignName={profile.campaign_name || null}
      activeSession={activeSession}
      pastSessions={pastSessions}
      dmEmail={profile.dm_email || null}
    />
  )
}
