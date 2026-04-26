'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface BurgerMenuProps {
  loggedIn?: boolean
  role?: 'player' | 'dm' | 'admin' | null
}

const LOGGED_OUT_LINKS = [
  { href: '/',        label: 'Home' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/about',   label: 'About' },
  { href: '/faq',     label: 'FAQ' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/contact', label: 'Contact' },
]

const PLAYER_LINKS = [
  { href: '/play/now',     label: 'My Character' },
  { href: '/play/session', label: 'Session' },
  { href: '/play/journey', label: 'Journey' },
  { href: '/settings',     label: 'Settings' },
]

const DM_LINKS = [
  { href: '/dm/dashboard', label: 'Campaign' },
  { href: '/dm/dashboard', label: 'Dashboard' },
  { href: '/settings',     label: 'Settings' },
]

export default function BurgerMenu({ loggedIn = false, role }: BurgerMenuProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const links = !loggedIn
    ? LOGGED_OUT_LINKS
    : role === 'dm' ? DM_LINKS : PLAYER_LINKS

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
  }

  return (
    <>
      {/* Burger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-50 flex flex-col justify-center items-center gap-1.5"
        style={{
          width: 44,
          height: 44,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 2,
        }}
        aria-label="Open menu"
      >
        <span style={{ display: 'block', width: 18, height: 1.5, background: 'var(--text-dim)' }} />
        <span style={{ display: 'block', width: 18, height: 1.5, background: 'var(--text-dim)' }} />
        <span style={{ display: 'block', width: 12, height: 1.5, background: 'var(--text-dim)' }} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.nav
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
              style={{
                width: 280,
                background: 'var(--surface)',
                borderLeft: '1px solid var(--border)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5"
                   style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="font-cinzel text-sm tracking-wider"
                      style={{ color: 'var(--accent)' }}>In Character</span>
                <button
                  onClick={() => setOpen(false)}
                  style={{ color: 'var(--text-dim)', fontSize: 20, minHeight: 44, minWidth: 44 }}
                  className="flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              {/* Links */}
              <div className="flex-1 overflow-y-auto py-4">
                {links.map(link => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center px-6 py-3 font-garamond text-base transition-colors"
                    style={{ color: 'var(--text)', minHeight: 44 }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Sign out */}
              {loggedIn && (
                <div className="px-6 py-5" style={{ borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={handleSignOut}
                    className="font-garamond text-sm w-full text-left"
                    style={{ color: 'var(--text-faint)', minHeight: 44 }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
