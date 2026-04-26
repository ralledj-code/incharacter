import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Smart redirect — routes user to the correct destination based on role and character status.
// Admin users get player view if they have a character; /admin is always in burger menu.
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding?role=player')

  const role = (profile as { role: string | null }).role

  if (role === 'dm') redirect('/dm/dashboard')

  // Player or admin — check if they have a character
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: character } = await (supabase.from('characters') as any)
    .select('id')
    .eq('player_id', user.id)
    .limit(1)
    .single()

  if (!character) {
    // No character yet — go to onboarding, then /admin accessible from burger
    redirect('/onboarding?role=player')
  }

  // Has a character → play view; admin panel reachable via burger menu
  redirect('/play/now')
}
