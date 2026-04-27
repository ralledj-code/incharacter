import { createClient } from '@/lib/supabase/server'
import PlayerNav from '@/components/PlayerNav'

export default async function PlayLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Top bar always shows — settings icon links to settings
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top bar */}
      <div style={{
        height: 44, background: 'var(--surface)', borderBottom: '0.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text)' }}>
          In Character
        </span>
        {user && (
          <a href="/settings" style={{ fontSize: 13, color: 'var(--text3)', textDecoration: 'none', minHeight: 'auto', minWidth: 'auto', padding: '4px 8px' }}>
            Settings
          </a>
        )}
      </div>

      {/* Mobile: tab nav + constrained content */}
      <div className="md:hidden">
        <div style={{ maxWidth: 520, margin: '0 auto', paddingBottom: 80 }}>
          {children}
        </div>
        <PlayerNav />
      </div>

      {/* Desktop: full width (PlayerDesktop handles its own layout) */}
      <div className="hidden md:block" style={{ height: 'calc(100vh - 44px)' }}>
        {children}
      </div>
    </div>
  )
}
