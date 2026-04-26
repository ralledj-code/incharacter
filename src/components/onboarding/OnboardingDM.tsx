'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Step = 1 | 2 | 3 | 4

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i + 1 === current ? 20 : 6,
            height: 6,
            background: i + 1 <= current ? 'var(--gold)' : 'var(--gold-faint)',
          }}
        />
      ))}
    </div>
  )
}

const TONES = [
  { id: 'dark',     label: 'Dark',    desc: 'Grim, morally complex, heavy' },
  { id: 'heroic',   label: 'Heroic',  desc: 'High stakes, clear purpose, earned triumph' },
  { id: 'comedic',  label: 'Comedic', desc: 'Loose, fun, moments of genuine levity' },
  { id: 'mystery',  label: 'Mystery', desc: 'Intrigue, unreliable information, slow reveals' },
]

export default function OnboardingDM() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [campaignId, setCampaignId] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tone, setTone] = useState('')
  const [emails, setEmails] = useState(['', '', '', '', '', ''])

  async function createCampaign() {
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = (t: string) => (supabase.from(t) as any)

      const { data: campaign, error: err } = await db('campaigns')
        .insert({ dm_id: user.id, name, description: `${tone ? `[${tone}] ` : ''}${description}` })
        .select()
        .single()

      if (err) throw err
      setCampaignId((campaign as { id: string }).id)
      setStep(2)
    } catch {
      setError('Could not create campaign. Try again.')
    }
    setLoading(false)
  }

  async function sendInvites() {
    setLoading(true)
    setError('')
    const validEmails = emails.filter(e => e.trim() && e.includes('@'))
    try {
      const res = await fetch('/api/dm/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, emails: validEmails }),
      })
      if (!res.ok) throw new Error('Invite failed')
      setStep(3)
    } catch {
      setError('Some invites failed to send. You can retry from your dashboard.')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-start px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="font-cinzel text-gold text-2xl tracking-wider">In Character</h1>
          <p className="label-caps mt-1">DM Setup</p>
        </div>

        <ProgressDots current={step} total={4} />

        {/* Step 1: Create campaign */}
        {step === 1 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="font-cinzel text-ink text-lg tracking-wider">Create your campaign</h2>

            <div>
              <p className="label-caps mb-2">Campaign Name</p>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3"
                placeholder="The Shattered Crown"
              />
            </div>

            <div>
              <p className="label-caps mb-2">Description</p>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3 min-h-[100px]"
                placeholder="What's this campaign about?"
              />
            </div>

            <div>
              <p className="label-caps mb-3">Tone</p>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className="p-3 text-left transition-all"
                    style={{
                      background: 'var(--surface)',
                      border: `1px solid ${tone === t.id ? 'var(--gold)' : 'var(--border)'}`,
                      borderRadius: 2,
                    }}
                  >
                    <p className="font-cinzel text-xs tracking-wider text-gold mb-1">{t.label}</p>
                    <p className="font-garamond text-ink-dim text-xs">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="font-garamond text-sm italic" style={{ color: 'var(--red)' }}>{error}</p>}

            <button
              className="btn-gold-solid w-full py-4 disabled:opacity-40"
              onClick={createCampaign}
              disabled={!name.trim() || loading}
            >
              {loading ? 'Creating...' : 'Create Campaign →'}
            </button>
          </div>
        )}

        {/* Step 2: Invite players */}
        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="font-cinzel text-ink text-lg tracking-wider">Invite your players</h2>
            <p className="font-garamond text-ink-dim leading-relaxed">
              They&rsquo;ll receive a magic link to create their characters and join your campaign.
            </p>

            <div className="space-y-2">
              {emails.map((email, i) => (
                <input
                  key={i}
                  type="email"
                  value={email}
                  onChange={e => setEmails(prev => prev.map((v, j) => j === i ? e.target.value : v))}
                  className="w-full px-4 py-3"
                  placeholder={`Player ${i + 1} email`}
                />
              ))}
            </div>

            <div className="card-dark p-4">
              <p className="label-caps mb-1 text-ink-faint">Campaign ID</p>
              <p className="font-mono text-xs text-ink-dim break-all">{campaignId}</p>
              <p className="font-garamond text-ink-faint text-xs mt-2">
                Share this with players who already have accounts.
              </p>
            </div>

            {error && <p className="font-garamond text-sm italic" style={{ color: 'var(--red)' }}>{error}</p>}

            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-3" onClick={() => setStep(3)}>Skip</button>
              <button
                className="btn-gold-solid flex-1 py-3 disabled:opacity-40"
                onClick={sendInvites}
                disabled={loading || emails.every(e => !e.trim())}
              >
                {loading ? 'Sending...' : 'Send Invites →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Dashboard preview */}
        {step === 3 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="font-cinzel text-ink text-lg tracking-wider">Your Dashboard</h2>

            {[
              { title: 'Party View', desc: "See all your players' current emotional states at a glance. Their glyph, their directive, their last three moves." },
              { title: 'Session Notes', desc: "Private DM notes per session. Not visible to players." },
              { title: 'Pre-Session Brief', desc: "One button generates a full party brief — who's where emotionally, what tensions exist, what hooks to run." },
            ].map(item => (
              <div key={item.title} className="card-dark card-gold-border p-4">
                <h3 className="font-cinzel text-gold text-sm tracking-wider mb-2">{item.title}</h3>
                <p className="font-garamond text-ink-dim text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}

            <button className="btn-gold-solid w-full py-4" onClick={() => setStep(4)}>
              Continue →
            </button>
          </div>
        )}

        {/* Step 4: Done */}
        {step === 4 && (
          <div className="animate-fade-in space-y-6 text-center">
            <div className="text-gold text-4xl mb-2">✦</div>
            <h2 className="font-cinzel text-ink text-lg tracking-wider">Campaign ready.</h2>
            <p className="font-garamond text-ink-dim leading-relaxed">
              Your players will receive their invites. When they&rsquo;ve set up their characters,
              you&rsquo;ll see them on your dashboard.
            </p>
            <button
              className="btn-gold-solid w-full py-4 text-sm tracking-widest"
              onClick={() => router.push('/dm/dashboard')}
            >
              Go to Dashboard →
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
