import PlayerNav from '@/components/PlayerNav'
import BurgerMenu from '@/components/BurgerMenu'

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen safe-bottom" style={{ background: 'var(--bg)' }}>
      <BurgerMenu loggedIn={true} role="player" />
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>
      <PlayerNav />
    </div>
  )
}
