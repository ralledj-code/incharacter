'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'player'
  const next = searchParams.get('next') || '/play/now'

  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}&role=${role}`,
      },
    })

    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center animate-fade-in">
        <div className="mb-6 text-gold text-3xl">✦</div>
        <h2 className="font-cinzel text-ink text-lg tracking-wider mb-3">Check your email</h2>
        <p className="font-garamond text-ink-dim leading-relaxed">
          A link has been sent to <span className="text-ink">{email}</span>.
          Click it to continue. It expires in one hour.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-8 label-caps text-ink-faint hover:text-ink-dim transition-colors"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {error && (
        <p className="font-garamond text-sm italic" style={{ color: 'var(--red)' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="btn-gold-solid w-full py-3 disabled:opacity-40"
      >
        {loading ? 'Sending...' : 'Send Magic Link'}
      </button>

      <p className="font-garamond text-ink-faint text-sm text-center leading-relaxed">
        No passwords. A link arrives in your inbox.
        Click it and you&rsquo;re in.
      </p>
    </form>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-cinzel text-gold text-3xl tracking-wider mb-2">In Character</h1>
          <p className="font-garamond text-ink-dim italic">Your character, in character.</p>
        </div>

        <div className="card-dark p-8">
          <Suspense fallback={<div className="h-32 loading-shimmer rounded" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center mt-6 font-garamond text-ink-faint text-sm">
          New here?{' '}
          <span className="text-ink-dim">
            Your DM will invite you by email, or create a character to get started.
          </span>
        </p>
      </div>
    </main>
  )
}
