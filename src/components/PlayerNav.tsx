'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/play/now',     label: 'Now' },
  { href: '/play/session', label: 'Session' },
  { href: '/play/journey', label: 'Journey' },
]

export default function PlayerNav() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
      background: 'var(--surface)', borderTop: '0.5px solid var(--border)',
      display: 'flex', justifyContent: 'center',
    }}>
      <div style={{ display: 'flex', maxWidth: 480, width: '100%' }}>
        {TABS.map(tab => {
          const active = pathname === tab.href
          return (
            <Link key={tab.href} href={tab.href}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '10px 0 12px',
                textDecoration: 'none', minHeight: 'auto', minWidth: 'auto',
                borderBottom: active ? '1.5px solid var(--accent)' : '1.5px solid transparent',
              }}>
              <span style={{
                fontSize: 13, fontWeight: active ? 500 : 400,
                color: active ? 'var(--accent-text)' : 'var(--text3)',
                letterSpacing: '-0.01em',
              }}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
