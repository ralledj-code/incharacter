'use client'

import { useState } from 'react'
import Link from 'next/link'
import BurgerMenu from '@/components/BurgerMenu'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      if (!res.ok) throw new Error('Send failed')
      setSent(true)
    } catch {
      setError('Something went wrong. Try emailing ralledj@gmail.com directly.')
    }
    setLoading(false)
  }

  return (
    <div className="animate-page min-h-screen" style={{ background: 'var(--bg)' }}>
      <BurgerMenu loggedIn={false} />
      <main className="max-w-lg mx-auto px-6 py-20">
        <p className="label-caps mb-4" style={{ color: 'var(--text-faint)' }}>Contact</p>
        <h1 className="font-cinzel text-3xl mb-12 tracking-wider" style={{ color: 'var(--text)' }}>
          Get in touch.
        </h1>

        {sent ? (
          <div className="card-dark card-gold-border p-8 text-center animate-fade-in">
            <div className="text-3xl mb-4" style={{ color: 'var(--accent)' }}>✦</div>
            <p className="font-garamond text-lg" style={{ color: 'var(--text)' }}>
              Your message has been sent. We&rsquo;ll get back to you.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-caps block mb-2">Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                     className="w-full px-4 py-3" placeholder="Your name" required />
            </div>
            <div>
              <label className="label-caps block mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                     className="w-full px-4 py-3" placeholder="you@somewhere.com" required />
            </div>
            <div>
              <label className="label-caps block mb-2">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                        className="w-full px-4 py-3 min-h-[140px]"
                        placeholder="What's on your mind?" required />
            </div>
            {error && (
              <p className="font-garamond text-sm" style={{ color: 'var(--red)' }}>{error}</p>
            )}
            <button type="submit" disabled={loading}
                    className="btn-gold-solid w-full py-3 text-sm disabled:opacity-40">
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}

        <div className="mt-10">
          <Link href="/" className="btn-gold px-6 py-3 text-xs">← Back Home</Link>
        </div>
      </main>
    </div>
  )
}
