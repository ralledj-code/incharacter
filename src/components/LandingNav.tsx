'use client'

import Link from 'next/link'

const NAV_LINKS = [
  { href: '/#how-it-works', label: 'How It Works', anchor: true },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
]

export default function LandingNav() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4"
      style={{
        background: 'rgba(250,249,247,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e8e4df',
      }}
    >
      <Link
        href="/"
        className="font-cinzel text-lg font-semibold tracking-wider"
        style={{ color: '#c9a84c', minHeight: 'auto', minWidth: 'auto' }}
      >
        In Character
      </Link>

      <nav className="hidden md:flex items-center gap-6">
        {NAV_LINKS.map(l => (
          <a
            key={l.label}
            href={l.href}
            className="font-garamond text-sm landing-nav-link"
            style={{ color: '#4a4a4a', minHeight: 'auto', minWidth: 'auto' }}
          >
            {l.label}
          </a>
        ))}
        <Link
          href="/auth/login"
          className="btn-gold-solid px-5 text-xs"
          style={{ minHeight: 36, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
        >
          Sign In
        </Link>
      </nav>

      {/* Mobile burger is handled by BurgerMenu fixed-position button */}
    </header>
  )
}
