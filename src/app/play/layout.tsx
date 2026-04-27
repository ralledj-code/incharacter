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
    // Max-width 480px on mobile, full-width on desktop (desktop uses its own layout)
    <div className="min-h-screen safe-bottom" style={{ background: 'var(--bg)' }}>
      {/* Burger menu — shown on mobile only (desktop layout has no burger) */}
      <div className="block md:hidden">
        <BurgerMenu loggedIn={true} role={role} />
      </div>

      {/* On mobile: constrained width + bottom nav */}
      <div className="md:hidden">
        <div className="mx-auto flex flex-col min-h-screen" style={{ maxWidth: 480, background: 'var(--bg)' }}>
          <main className="flex-1 overflow-auto pb-20">
            {children}
          </main>
          <PlayerNav />
        </div>
      </div>

      {/* On desktop: full width, no bottom nav, desktop layout handles itself */}
      <div className="hidden md:block">
        {children}
      </div>
    </div>
  )
}
