'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) {
        setError(err.message)
      } else {
        setDone(true)
        setTimeout(() => router.push('/auth/login'), 2500)
      }
    } catch {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 animate-page"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-cinzel text-3xl tracking-wider mb-2" style={{ color: 'var(--accent)' }}>
            In Character
          </h1>
        </div>

        <div className="card-dark p-8">
          {done ? (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="text-2xl" style={{ color: 'var(--accent)' }}>✦</div>
              <p className="font-garamond" style={{ color: 'var(--text)' }}>
                Password updated. Redirecting to sign in...
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-cinzel text-sm tracking-widest mb-6" style={{ color: 'var(--text)' }}>
                Set New Password
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label-caps block mb-2">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-3"
                    minLength={8}
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label className="label-caps block mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3"
                    required
                  />
                </div>
                {error && (
                  <div className="p-3" style={{ background: 'var(--red-dim)', borderRadius: 2 }}>
                    <p className="font-garamond text-sm" style={{ color: '#f0b0b0' }}>{error}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || !password || !confirm}
                  className="btn-gold-solid w-full py-3 disabled:opacity-40"
                >
                  {loading ? 'Saving...' : 'Set New Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
