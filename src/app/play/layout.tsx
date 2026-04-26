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
      .select('role').eq('id', user.id).single()
    if (profile?.role === 'admin') role = 'admin'
    else if (profile?.role === 'dm') role = 'dm'
  }

  return (
    // Fix 11: max-width 480px, centered, dark background outside
    <div className="min-h-screen safe-bottom" style={{ background: 'var(--surface)' }}>
      <div
        className="mx-auto flex flex-col min-h-screen safe-bottom"
        style={{ maxWidth: 480, background: 'var(--bg)', position: 'relative' }}
      >
        <BurgerMenu loggedIn={true} role={role} />
        <main className="flex-1 overflow-auto pb-20">
          {children}
        </main>
        <PlayerNav />
      </div>
    </div>
  )
}
