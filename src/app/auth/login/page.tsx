'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Tab = 'signin' | 'signup'

const ROLE_KEY = 'ic_signup_role'

function AuthForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const role = searchParams.get('role') || 'player'
  const next = searchParams.get('next') || '/dashboard'
  const confirmed = searchParams.get('confirmed') === 'true'

  const isDM = role === 'dm'

  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [signupDone, setSignupDone] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (err) {
        if (err.message.toLowerCase().includes('email not confirmed')) {
          setError('Please confirm your email first. Check your inbox.')
        } else if (err.message.toLowerCase().includes('invalid login') || err.message.toLowerCase().includes('invalid credentials')) {
          setError("That email or password isn't right.")
        } else {
          setError(err.message)
        }
      } else {
        // After sign-in, save role from URL param if DM — trigger always inserts 'player'
        if (isDM) {
          const { data: { user: signedInUser } } = await supabase.auth.getUser()
          if (signedInUser) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from('profiles') as any).upsert(
              { id: signedInUser.id, role: 'dm' },
              { onConflict: 'id' }
            )
          }
        }
        router.push(next)
      }
    } catch {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      // Persist role in localStorage so it survives the email confirmation redirect
      if (typeof window !== 'undefined') {
        localStorage.setItem(ROLE_KEY, role)
      }

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const supabase = createClient()
      const { error: err } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}&role=${encodeURIComponent(role)}`,
          data: { role }, // read by handle_new_user trigger
        },
      })
      if (err) {
        setError(err.message)
      } else {
        setSignupDone(true)
      }
    } catch {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    if (!forgotEmail.trim()) return
    setLoading(true)
    setError('')
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const supabase = createClient()
      const { error: err } = await supabase.auth.resetPasswordForEmail(
        forgotEmail.trim().toLowerCase(),
        { redirectTo: `${siteUrl}/auth/reset-password` }
      )
      if (err) {
        setError(err.message)
      } else {
        setForgotSent(true)
      }
    } catch {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  // ── Forgot password overlay ───────────────────────────
  if (showForgot) {
    return (
      <div className="animate-fade-in">
        <button
          onClick={() => { setShowForgot(false); setForgotSent(false); setError('') }}
          className="label-caps mb-6 block"
          style={{ color: 'var(--text-faint)', minHeight: 'auto', minWidth: 'auto' }}
        >
          ← Back to sign in
        </button>

        {forgotSent ? (
          <div className="text-center space-y-3">
            <div className="text-2xl" style={{ color: 'var(--accent)' }}>✦</div>
            <p className="font-garamond" style={{ color: 'var(--text)' }}>
              Password reset email sent. Check your inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label className="label-caps block mb-2">Your Email</label>
              <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                placeholder="you@somewhere.com" className="w-full px-4 py-3" autoFocus required />
            </div>
            {error && <p className="font-garamond text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
            <button type="submit" disabled={loading || !forgotEmail.trim()}
              className="btn-gold-solid w-full py-3 disabled:opacity-40">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    )
  }

  // ── Sign up done ───────────────────────────────────────
  if (signupDone) {
    return (
      <div className="text-center space-y-4 animate-fade-in">
        <div className="text-2xl" style={{ color: 'var(--accent)' }}>✦</div>
        <h2 className="font-cinzel text-base tracking-wider" style={{ color: 'var(--text)' }}>
          Check your email
        </h2>
        <p className="font-garamond leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          We sent a confirmation link to <span style={{ color: 'var(--text)' }}>{email}</span>.
          Click it to activate your {isDM ? 'DM' : 'player'} account, then come back and sign in.
        </p>
        <button
          onClick={() => { setSignupDone(false); setTab('signin'); setPassword(''); setConfirmPassword('') }}
          className="label-caps"
          style={{ color: 'var(--text-faint)', minHeight: 'auto', minWidth: 'auto' }}
        >
          Back to sign in
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Role indicator — makes it clear which path the user is on */}
      <div className="mb-5 p-3 animate-fade-in"
           style={{ background: isDM ? 'var(--gold-faint)' : 'var(--surface2)', borderLeft: '2px solid var(--accent)', borderRadius: 2 }}>
        <p className="font-cinzel text-xs tracking-widest" style={{ color: 'var(--accent)' }}>
          {isDM ? 'Creating a DM account' : 'Creating a player account'}
        </p>
      </div>

      {/* Confirmation banner */}
      {confirmed && (
        <div className="mb-5 p-4 animate-fade-in"
             style={{ background: 'var(--gold-faint)', borderLeft: '2px solid var(--accent)', borderRadius: 2 }}>
          <p className="font-garamond text-sm" style={{ color: 'var(--accent)' }}>
            Email confirmed. Sign in below.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex mb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        {(['signin', 'signup'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setError('') }}
            className="flex-1 pb-3 font-cinzel text-xs tracking-widest transition-colors"
            style={{
              color: tab === t ? 'var(--accent)' : 'var(--text-faint)',
              borderBottom: tab === t ? '1px solid var(--accent)' : '1px solid transparent',
              marginBottom: -1, minHeight: 'auto',
            }}>
            {t === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        ))}
      </div>

      {/* Sign In */}
      {tab === 'signin' && (
        <form onSubmit={handleSignIn} className="space-y-4 animate-fade-in">
          <div>
            <label className="label-caps block mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@somewhere.com" className="w-full px-4 py-3" autoFocus required />
          </div>
          <div>
            <label className="label-caps block mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className="w-full px-4 py-3" required />
          </div>

          {error && (
            <div className="p-3" style={{ background: 'var(--red-dim)', borderRadius: 2 }}>
              <p className="font-garamond text-sm" style={{ color: '#f0b0b0' }}>{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading || !email.trim() || !password}
            className="btn-gold-solid w-full py-3 disabled:opacity-40">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <button type="button" onClick={() => { setShowForgot(true); setForgotEmail(email); setError('') }}
            className="w-full text-center font-garamond text-sm"
            style={{ color: 'var(--text-faint)', minHeight: 'auto' }}>
            Forgot password?
          </button>
        </form>
      )}

      {/* Sign Up */}
      {tab === 'signup' && (
        <form onSubmit={handleSignUp} className="space-y-4 animate-fade-in">
          <div>
            <label className="label-caps block mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@somewhere.com" className="w-full px-4 py-3" autoFocus required />
          </div>
          <div>
            <label className="label-caps block mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters" className="w-full px-4 py-3" minLength={8} required />
          </div>
          <div>
            <label className="label-caps block mb-2">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••" className="w-full px-4 py-3" required />
          </div>

          {error && (
            <div className="p-3" style={{ background: 'var(--red-dim)', borderRadius: 2 }}>
              <p className="font-garamond text-sm" style={{ color: '#f0b0b0' }}>{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading || !email.trim() || !password || !confirmPassword}
            className="btn-gold-solid w-full py-3 disabled:opacity-40">
            {loading ? 'Creating account...' : isDM ? 'Create DM Account' : 'Create Account'}
          </button>

          {/* Role switcher */}
          <div className="text-center pt-1">
            <Link
              href={`/auth/login?role=${isDM ? 'player' : 'dm'}`}
              className="font-garamond text-sm"
              style={{ color: 'var(--text-faint)', minHeight: 'auto', minWidth: 'auto' }}
            >
              {isDM
                ? 'Not a DM? Sign up as a player instead →'
                : 'Running a campaign? Sign up as a DM instead →'}
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 animate-page"
          style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-cinzel text-3xl tracking-wider mb-2" style={{ color: 'var(--accent)' }}>
            In Character
          </h1>
          <p className="font-garamond" style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
            Your character, in character.
          </p>
        </div>

        <div className="card-dark p-8">
          <Suspense fallback={<div className="h-40 loading-shimmer rounded" />}>
            <AuthForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
