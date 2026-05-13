'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface BurgerMenuProps {
  loggedIn?: boolean
  theme?: 'light' | 'dark'
}

const LOGGED_OUT_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/contact', label: 'Contact' },
]

const PLAYER_LINKS = [
  { href: '/play', label: 'My Journal' },
  { href: '/settings', label: 'Settings' },
]

export default function BurgerMenu({ loggedIn = false, theme = 'dark' }: BurgerMenuProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const isLight = theme === 'light'
  const drawerBg = isLight ? '#ffffff' : 'var(--surface)'
  const drawerBorder = isLight ? '#e8e4df' : 'var(--border)'
  const linkColor = isLight ? '#1a1a1a' : 'var(--text)'
  const linkHoverColor = '#c9a84c'
  const btnBg = isLight ? '#ffffff' : 'var(--surface)'
  const btnBorder = isLight ? '#e8e4df' : 'var(--border)'
  const lineColor = isLight ? '#4a4a4a' : 'var(--text-dim)'

  const links = loggedIn ? PLAYER_LINKS : LOGGED_OUT_LINKS

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
  }

  return (
    <>
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="fixed top-4 right-4 z-50 flex flex-col justify-center items-center gap-1.5"
        style={{ width: 44, height: 44, background: btnBg, border: `1px solid ${btnBorder}`, borderRadius: 3 }}
      >
        <motion.span
          animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'block', width: 18, height: 1.5, background: lineColor, transformOrigin: 'center' }}
        />
        <motion.span
          animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.15 }}
          style={{ display: 'block', width: 18, height: 1.5, background: lineColor }}
        />
        <motion.span
          animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'block', width: 14, height: 1.5, background: lineColor, transformOrigin: 'center' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.45)' }}
              onClick={() => setOpen(false)}
            />
            <motion.nav
              key="drawer"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
              style={{ width: 280, background: drawerBg, borderLeft: `1px solid ${drawerBorder}` }}
            >
              <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${drawerBorder}` }}>
                <span className="font-cinzel text-sm tracking-wider" style={{ color: '#c9a84c' }}>In Character</span>
                <button onClick={() => setOpen(false)}
                  style={{ color: lineColor, fontSize: 22, minHeight: 44, minWidth: 44 }}
                  className="flex items-center justify-center">×</button>
              </div>
              <div className="flex-1 overflow-y-auto py-3">
                {links.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center px-6 py-3 font-garamond text-base transition-colors"
                    style={{ color: linkColor, minHeight: 50 }}
                    onMouseEnter={e => (e.currentTarget.style.color = linkHoverColor)}
                    onMouseLeave={e => (e.currentTarget.style.color = linkColor)}
                  >
                    {link.label}
                  </Link>
                ))}
                {!loggedIn && (
                  <>
                    <div style={{ margin: '8px 24px', borderTop: `1px solid ${drawerBorder}` }} />
                    <Link href="/auth/login" onClick={() => setOpen(false)}
                      className="flex items-center px-6 py-3 font-cinzel text-xs tracking-widest"
                      style={{ color: '#c9a84c', minHeight: 50 }}>
                      Sign In
                    </Link>
                  </>
                )}
              </div>
              {loggedIn && (
                <div className="px-6 py-5" style={{ borderTop: `1px solid ${drawerBorder}` }}>
                  <button onClick={handleSignOut} className="font-garamond text-sm w-full text-left"
                    style={{ color: 'var(--text-faint, #8a8a8a)', minHeight: 44 }}>
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
