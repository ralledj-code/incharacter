'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/play/now',     label: 'NOW',     icon: '◈' },
  { href: '/play/session', label: 'SESSION', icon: '◆' },
  { href: '/play/journey', label: 'JOURNEY', icon: '◉' },
]

export default function PlayerNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 safe-bottom"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="flex">
        {TABS.map(tab => {
          const active = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center py-3 gap-1 transition-colors"
              style={{ color: active ? 'var(--gold)' : 'var(--text-faint)' }}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              <span
                className="font-cinzel"
                style={{ fontSize: '0.55rem', letterSpacing: '0.15em' }}
              >
                {tab.label}
              </span>
              {active && (
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'var(--gold)' }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
