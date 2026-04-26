import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminPanel from '@/components/AdminPanel'
import type { ErrorLog, Profile } from '@/types/database'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profileData = profile as { role: string | null } | null
  if (profileData?.role !== 'admin') {
    redirect('/play/now')
  }

  const [{ data: errors }, { data: users }] = await Promise.all([
    supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  return <AdminPanel errors={(errors || []) as ErrorLog[]} users={(users || []) as Profile[]} />
}
