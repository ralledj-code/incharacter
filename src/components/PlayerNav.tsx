'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/play/now',     label: 'Now' },
  { href: '/play/session', label: 'Session' },
  { href: '/play/journey', label: 'Motivations' },
]

export default function PlayerNav() {
  const pathname = usePathname()

  return (
    // FIX 4+5: always visible, sticky below top bar (top: 44px), all viewports
    <nav style={{
      position: 'sticky',
      top: 44,
      zIndex: 40,
      background: 'var(--bg2)',
      borderBottom: '0.5px solid var(--border)',
      display: 'flex',
      overflowX: 'auto',
    }}>
      {TABS.map(tab => {
        const active = pathname === tab.href
        return (
          <Link key={tab.href} href={tab.href}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 14px',
              textDecoration: 'none',
              minHeight: 'auto',
              minWidth: 64,
              borderBottom: active ? '1.5px solid var(--accent)' : '1.5px solid transparent',
              fontSize: 13,
              fontWeight: active ? 500 : 400,
              color: active ? 'var(--accent-text)' : 'var(--text2)',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
            }}>
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
