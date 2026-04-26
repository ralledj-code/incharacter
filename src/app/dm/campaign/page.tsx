'use client'

import { useState, useEffect } from 'react'
import BurgerMenu from '@/components/BurgerMenu'
import { createClient } from '@/lib/supabase/client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

export default function DMCampaignPage() {
  const [campaign, setCampaign] = useState<AnyRecord | null>(null)
  const [members, setMembers] = useState<AnyRecord[]>([])
  const [emails, setEmails] = useState(['', '', '', ''])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const db = (t: string) => (supabase.from(t) as AnyRecord)

      const { data: camp } = await db('campaigns')
        .select('id, name, campaign_code')
        .eq('dm_id', user.id)
        .eq('archived', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      setCampaign(camp)

      if (camp) {
        const { data: memberRows } = await db('campaign_members')
          .select('player_id, accepted, profiles(username)')
          .eq('campaign_id', camp.id)
        setMembers(memberRows || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  async function sendInvites() {
    const validEmails = emails.filter(e => e.trim())
    if (!validEmails.length || !campaign) return
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/dm/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.id, emails: validEmails }),
      })
      if (res.ok) {
        setSent(true)
        setEmails(['', '', '', ''])
      } else {
        setError('Some invites failed. Check Resend API key in Settings.')
      }
    } catch {
      setError('Could not send invites.')
    }
    setSending(false)
  }

  async function removeMember(playerId: string) {
    if (!campaign) return
    const supabase = createClient()
    await (supabase.from('campaign_members') as AnyRecord)
      .delete()
      .eq('campaign_id', campaign.id)
      .eq('player_id', playerId)
    setMembers(prev => prev.filter(m => m.player_id !== playerId))
  }

  function copyCampaignCode() {
    if (!campaign?.campaign_code) return
    navigator.clipboard.writeText(campaign.campaign_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <p className="font-garamond animate-pulse" style={{ color: 'var(--text-dim)' }}>Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <BurgerMenu loggedIn={true} role="dm" />

      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-cinzel text-2xl tracking-wider mb-8" style={{ color: 'var(--accent)' }}>
          Campaign
        </h1>

        {!campaign ? (
          <div className="card-dark p-6 text-center">
            <p className="font-garamond mb-4" style={{ color: 'var(--text-dim)' }}>No active campaign.</p>
            <a href="/onboarding?role=dm" className="btn-gold-solid px-8 py-3 inline-block text-sm">
              Create Campaign
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Campaign code — large and prominent */}
            <section>
              <p className="label-caps mb-3">Campaign Code</p>
              <button onClick={copyCampaignCode}
                      className="w-full card-dark p-6 flex items-center justify-between"
                      style={{ minHeight: 72 }}>
                <span className="font-cinzel text-2xl tracking-widest" style={{ color: 'var(--accent)' }}>
                  {campaign.campaign_code || 'CAMP-????-????'}
                </span>
                <span className="label-caps ml-4 flex-shrink-0"
                      style={{ color: copied ? 'var(--accent)' : 'var(--text-faint)' }}>
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
              <p className="font-garamond text-sm mt-2" style={{ color: 'var(--text-faint)', fontSize: 14 }}>
                Share this code with your players. They enter it during onboarding or in Settings.
              </p>
            </section>

            {/* Invite players */}
            <section>
              <p className="label-caps mb-3">Invite Players by Email</p>
              <div className="space-y-2">
                {emails.map((email, i) => (
                  <input key={i} type="email" value={email}
                    onChange={e => setEmails(prev => prev.map((v, j) => j === i ? e.target.value : v))}
                    className="w-full px-4 py-3" placeholder={`Player ${i + 1} email`}
                    style={{ fontSize: 15 }} />
                ))}
              </div>
              {error && <p className="font-garamond text-sm mt-2" style={{ color: 'var(--red)', fontSize: 14 }}>{error}</p>}
              {sent && (
                <p className="font-garamond text-sm mt-2 animate-fade-in" style={{ color: 'var(--accent)', fontSize: 14 }}>
                  Invites sent. Players will receive an email with a signup link.
                </p>
              )}
              <button onClick={sendInvites}
                      disabled={sending || !emails.some(e => e.trim())}
                      className="btn-gold-solid mt-4 w-full py-3 disabled:opacity-40"
                      style={{ fontSize: 15 }}>
                {sending ? 'Sending...' : 'Send Invites'}
              </button>
            </section>

            {/* Current players */}
            {members.length > 0 && (
              <section>
                <p className="label-caps mb-3">Players ({members.length})</p>
                <div className="space-y-2">
                  {members.map(m => (
                    <div key={m.player_id} className="card-dark p-4 flex items-center justify-between">
                      <div>
                        <p className="font-garamond" style={{ color: 'var(--text)', fontSize: 15 }}>
                          {(m.profiles as AnyRecord)?.username || 'Unknown'}
                        </p>
                        <p className="label-caps" style={{ color: m.accepted ? 'var(--accent)' : 'var(--text-faint)' }}>
                          {m.accepted ? 'Joined' : 'Invited'}
                        </p>
                      </div>
                      <button onClick={() => removeMember(m.player_id)}
                              className="font-cinzel text-xs px-3 py-2 transition-all"
                              style={{ color: 'var(--red)', border: '1px solid var(--red-dim)', borderRadius: 2, minHeight: 44 }}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
