'use client'

import { useState } from 'react'
import Link from 'next/link'
import BurgerMenu from '@/components/BurgerMenu'
import LandingTheme from '@/components/LandingTheme'

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
      if (!res.ok) throw new Error()
      setSent(true)
    } catch {
      setError('Something went wrong. Try emailing ralledj@gmail.com directly.')
    }
    setLoading(false)
  }

  return (
    <>
      <LandingTheme />
      <div className="min-h-screen" style={{ background: '#faf9f7', color: '#1a1a1a' }}>
        <BurgerMenu loggedIn={false} theme="light" />
        <main className="max-w-lg mx-auto px-6 py-24 pt-20">
          <Link href="/" className="font-cinzel text-sm tracking-widest mb-10 block"
                style={{ color: '#c9a84c', minHeight: 'auto', minWidth: 'auto' }}>← In Character</Link>
          <h1 className="font-cinzel text-4xl mb-12" style={{ color: '#1a1a1a' }}>Get in touch.</h1>

          {sent ? (
            <div className="card-light p-10 text-center" style={{ borderLeft: '2px solid #c9a84c' }}>
              <div className="text-3xl mb-4" style={{ color: '#c9a84c' }}>✦</div>
              <p className="font-garamond text-xl" style={{ color: '#1a1a1a' }}>
                Your message has been sent. We&rsquo;ll get back to you.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { label: 'Name', value: name, set: setName, type: 'text', placeholder: 'Your name' },
                { label: 'Email', value: email, set: setEmail, type: 'email', placeholder: 'you@somewhere.com' },
              ].map(field => (
                <div key={field.label}>
                  <label className="font-cinzel text-xs tracking-widest block mb-2"
                         style={{ color: '#4a4a4a' }}>
                    {field.label.toUpperCase()}
                  </label>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={e => field.set(e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3"
                    style={{ background: '#ffffff', border: '1px solid #e8e4df', color: '#1a1a1a' }}
                    required
                  />
                </div>
              ))}
              <div>
                <label className="font-cinzel text-xs tracking-widest block mb-2" style={{ color: '#4a4a4a' }}>
                  MESSAGE
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full px-4 py-3 min-h-[140px]"
                  style={{ background: '#ffffff', border: '1px solid #e8e4df', color: '#1a1a1a' }}
                  required
                />
              </div>
              {error && <p className="font-garamond text-sm" style={{ color: '#c0392b' }}>{error}</p>}
              <button type="submit" disabled={loading}
                      className="btn-gold-solid w-full py-3 text-sm disabled:opacity-40">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </main>
      </div>
    </>
  )
}
