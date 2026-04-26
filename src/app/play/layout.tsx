import { createClient } from '@/lib/supabase/server'
import PlayerNav from '@/components/PlayerNav'
import BurgerMenu from '@/components/BurgerMenu'

export default async function PlayLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let role: 'player' | 'dm' | 'admin' = 'player'
  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from('profiles') as any)
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role === 'admin') role = 'admin'
    else if (profile?.role === 'dm') role = 'dm'
  }

  return (
    <div className="flex flex-col min-h-screen safe-bottom" style={{ background: 'var(--bg)' }}>
      <BurgerMenu loggedIn={true} role={role} />
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>
      <PlayerNav />
    </div>
  )
}
