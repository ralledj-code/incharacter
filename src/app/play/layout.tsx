import PlayerNav from '@/components/PlayerNav'

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-bg safe-bottom">
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>
      <PlayerNav />
    </div>
  )
}
