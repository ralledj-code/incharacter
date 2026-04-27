'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Tab = 'signin' | 'signup'

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
    setLoading(true); setError('')
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
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
        // Fix 2: Role exclusively from DB — no localStorage
        if (isDM) {
          const { data: { user: u } } = await supabase.auth.getUser()
          if (u) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from('profiles') as any).upsert({ id: u.id, role: 'dm' }, { onConflict: 'id' })
          }
        }
        router.push(next)
      }
    } catch { setError('Something went wrong. Try again.') }
    setLoading(false)
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault(); setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      // Fix 2: No localStorage — role goes in signUp metadata only
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const supabase = createClient()
      const { error: err } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}&role=${encodeURIComponent(role)}`,
          data: { role },
        },
      })
      if (err) { setError(err.message) } else { setSignupDone(true) }
    } catch { setError('Something went wrong. Try again.') }
    setLoading(false)
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    if (!forgotEmail.trim()) return
    setLoading(true); setError('')
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const supabase = createClient()
      const { error: err } = await supabase.auth.resetPasswordForEmail(
        forgotEmail.trim().toLowerCase(), { redirectTo: `${siteUrl}/auth/reset-password` }
      )
      if (err) { setError(err.message) } else { setForgotSent(true) }
    } catch { setError('Something went wrong. Try again.') }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    display: 'block', width: '100%',
    background: 'var(--surface)', border: '0.5px solid var(--border2)',
    color: 'var(--text)', fontSize: 15, borderRadius: 7,
    padding: '9px 12px', outline: 'none', minHeight: 42,
    fontFamily: 'inherit',
  }

  const s = { label: { fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text3)', display: 'block', marginBottom: 6 } as React.CSSProperties }

  if (showForgot) return (
    <div>
      <button onClick={() => { setShowForgot(false); setForgotSent(false); setError('') }}
        style={{ fontSize: 13, color: 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 20px', minHeight: 'auto' }}>
        ← Back
      </button>
      {forgotSent ? (
        <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.6 }}>Reset link sent. Check your inbox.</p>
      ) : (
        <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={s.label}>Email</label>
            <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
              placeholder="you@somewhere.com" style={inputStyle} autoFocus required /></div>
          {error && <p style={{ fontSize: 13, color: 'var(--danger)' }}>{error}</p>}
          <button type="submit" disabled={loading || !forgotEmail.trim()} className="btn-primary" style={{ width: '100%' }}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      )}
    </div>
  )

  if (signupDone) return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 15, color: 'var(--text)', marginBottom: 8, fontWeight: 500 }}>Check your email</p>
      <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 20 }}>
        We sent a confirmation link to <strong>{email}</strong>.
        Click it to activate your {isDM ? 'DM' : 'player'} account, then sign in.
      </p>
      <button onClick={() => { setSignupDone(false); setTab('signin'); setPassword(''); setConfirmPassword('') }}
        style={{ fontSize: 13, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}>
        Back to sign in
      </button>
    </div>
  )

  return (
    <div>
      {isDM && (
        <div style={{ marginBottom: 20, padding: '8px 12px', background: 'var(--accent-faint)', borderLeft: '2px solid var(--accent)', borderRadius: '0 6px 6px 0', fontSize: 12, color: 'var(--accent-text)', fontWeight: 500 }}>
          DM account
        </div>
      )}
      {confirmed && (
        <div style={{ marginBottom: 20, padding: '8px 12px', background: 'var(--accent-faint)', borderRadius: 6, fontSize: 13, color: 'var(--accent-text)' }}>
          Email confirmed. Sign in below.
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '0.5px solid var(--border)', marginBottom: 24 }}>
        {(['signin', 'signup'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setError('') }}
            style={{
              flex: 1, paddingBottom: 10, fontSize: 13, fontWeight: tab === t ? 500 : 400,
              color: tab === t ? 'var(--accent-text)' : 'var(--text2)',
              borderBottom: `1.5px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
              marginBottom: -0.5, background: 'none', border: 'none', borderRadius: 0,
              cursor: 'pointer', minHeight: 'auto',
            }}>
            {t === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        ))}
      </div>

      {tab === 'signin' && (
        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={s.label}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@somewhere.com" style={inputStyle} autoFocus required /></div>
          <div><label style={s.label}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" style={inputStyle} required /></div>
          {error && <p style={{ fontSize: 13, color: 'var(--danger)', background: 'var(--danger-faint)', padding: '8px 12px', borderRadius: 6 }}>{error}</p>}
          <button type="submit" disabled={loading || !email.trim() || !password} className="btn-primary" style={{ width: '100%' }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <button type="button" onClick={() => { setShowForgot(true); setForgotEmail(email); setError('') }}
            style={{ fontSize: 13, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '4px 0' }}>
            Forgot password?
          </button>
        </form>
      )}

      {tab === 'signup' && (
        <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={s.label}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@somewhere.com" style={inputStyle} autoFocus required /></div>
          <div><label style={s.label}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters" style={inputStyle} minLength={8} required /></div>
          <div><label style={s.label}>Confirm password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••" style={inputStyle} required /></div>
          {error && <p style={{ fontSize: 13, color: 'var(--danger)', background: 'var(--danger-faint)', padding: '8px 12px', borderRadius: 6 }}>{error}</p>}
          <button type="submit" disabled={loading || !email.trim() || !password || !confirmPassword}
            className="btn-primary" style={{ width: '100%' }}>
            {loading ? 'Creating account...' : isDM ? 'Create DM account' : 'Create account'}
          </button>
          <div style={{ textAlign: 'center' }}>
            <Link href={`/auth/login?role=${isDM ? 'player' : 'dm'}`}
              style={{ fontSize: 12, color: 'var(--text3)', minHeight: 'auto', minWidth: 'auto' }}>
              {isDM ? 'Sign up as player instead' : 'Running a campaign? Sign up as DM →'}
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 4 }}>In Character</h1>
          <p style={{ fontSize: 14, color: 'var(--text3)' }}>Your character, in character.</p>
        </div>
        <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 12, padding: 28 }}>
          <Suspense fallback={<div style={{ height: 160 }} />}>
            <AuthForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
