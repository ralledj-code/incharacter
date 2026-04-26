'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'player'
  const next = searchParams.get('next') || '/dashboard'
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const authFailedMessage = errorParam === 'auth_failed'
    ? 'Something went wrong with that link. Links expire after 24 hours — request a new one below.'
    : errorParam
    ? decodeURIComponent(errorParam)
    : ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}&role=${encodeURIComponent(role)}`

    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: redirectTo },
      })
      if (err) {
        setError(err.message)
      } else {
        setSent(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center animate-fade-in">
        <div className="mb-6 text-3xl btn-shimmer rounded-full w-12 h-12 mx-auto flex items-center justify-center"
             style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
          ✦
        </div>
        <h2 className="font-cinzel text-base tracking-wider mb-3" style={{ color: 'var(--text)' }}>
          Check your email
        </h2>
        <p className="font-garamond leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          A link has been sent to <span style={{ color: 'var(--text)' }}>{email}</span>.
          Click it to continue. It expires in one hour.
        </p>
        <button onClick={() => setSent(false)}
                className="mt-8 label-caps" style={{ color: 'var(--text-faint)' }}>
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {(error || authFailedMessage) && (
        <div className="card-dark p-4" style={{ borderColor: 'var(--red-dim)' }}>
          <p className="font-garamond text-sm" style={{ color: 'var(--red)' }}>
            {error || authFailedMessage}
          </p>
        </div>
      )}

      <div>
        <label className="label-caps block mb-2">Your Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@somewhere.com"
          className="w-full px-4 py-3"
          autoFocus
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="btn-gold-solid w-full py-3 disabled:opacity-40"
      >
        {loading ? 'Sending...' : 'Send Magic Link'}
      </button>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <p className="font-garamond text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          No password needed. Enter your email and we&rsquo;ll send you a link.
          Click it and you&rsquo;re in. Same email always returns you to your character.
        </p>
        <p className="font-garamond text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-faint)' }}>
          New here? Enter your email to begin. Your DM can also invite you directly.
        </p>
      </div>
    </form>
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
          <p className="font-garamond italic-permitted" style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
            Your character, in character.
          </p>
        </div>

        <div className="card-dark p-8">
          <Suspense fallback={<div className="h-32 loading-shimmer rounded" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
