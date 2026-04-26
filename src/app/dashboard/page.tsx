import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Smart redirect — routes user to the correct destination based on role and character status.
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (t: string) => (supabase.from(t) as any)

  // Ensure profile exists — may not exist if Supabase trigger wasn't set up
  let { data: profile } = await db('profiles').select('role').eq('id', user.id).single()

  if (!profile) {
    // Create profile with default player role
    await db('profiles').insert({
      id: user.id,
      username: user.email?.split('@')[0] || null,
      role: 'player',
    })
    profile = { role: 'player' }
  }

  const role = (profile as { role: string | null }).role

  if (role === 'admin') redirect('/admin')

  if (role === 'dm') {
    // DM: check if they have a campaign; if not, send to DM onboarding
    const { data: campaign } = await db('campaigns')
      .select('id').eq('dm_id', user.id).eq('archived', false).limit(1).single()
    if (!campaign) redirect('/onboarding?role=dm')
    redirect('/dm/dashboard')
  }

  // Player or admin without character — go to player onboarding
  const { data: character } = await db('characters')
    .select('id').eq('player_id', user.id).limit(1).single()

  if (!character) redirect('/onboarding?role=player')

  redirect('/play/now')
}
