import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Smart redirect: routes user to the correct destination based on role and character status.
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

  if (role === 'admin') redirect('/admin')
  if (role === 'dm') redirect('/dm/dashboard')

  // Player — check if they have a character
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: character } = await (supabase.from('characters') as any)
    .select('id')
    .eq('player_id', user.id)
    .limit(1)
    .single()

  if (!character) redirect('/onboarding?role=player')

  redirect('/play/now')
}
