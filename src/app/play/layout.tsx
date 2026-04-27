import { createClient } from '@/lib/supabase/server'
import PlayerNav from '@/components/PlayerNav'

export default async function PlayLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* FIX 5: sticky top bar, z-index 50 */}
      <div style={{
        height: 44,
        background: 'var(--surface)',
        borderBottom: '0.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text)' }}>
          In Character
        </span>
        {user && (
          <a href="/settings" style={{ fontSize: 13, color: 'var(--text3)', textDecoration: 'none', minHeight: 'auto', minWidth: 'auto', padding: '4px 0' }}>
            Settings
          </a>
        )}
      </div>

      {/* FIX 4+5: tab nav always visible and sticky at top: 44px, all viewports */}
      <PlayerNav />

      {/* FIX 1: single centred column on all viewports, max-width 520px */}
      <div style={{ maxWidth: 520, margin: '0 auto', paddingBottom: 24 }}>
        {children}
      </div>
    </div>
  )
}
