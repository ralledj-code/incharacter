'use client'

import { useState } from 'react'
import { Campaign, Character, TrackerState } from '@/types/database'
import ArcaneGlyph from './ArcaneGlyph'
import BurgerMenu from './BurgerMenu'
import { glyphValuesFromTrackers, GLYPH_STATES } from '@/lib/constants'

interface DMDashboardProps {
  campaigns: Campaign[]
  members: Array<{ campaign_id: string; player_id: string; accepted: boolean }>
  characters: Character[]
  trackers: TrackerState[]
  recentEvents: Array<{ character_id: string; category: string; reaction: string; created_at: string }>
}

const EVENT_COLORS: Record<string, string> = {
  violence:     '#8b2e2e',
  performance:  '#c9a84c',
  avoided:      '#5a4a30',
  indulged:     '#7a4028',
  dagger:       '#6b2e8b',
  opened_up:    '#2e6b5a',
  crossed_line: '#8b4a2e',
  mystery:      '#4a5a8b',
}

function CharacterCard({
  character,
  tracker,
  events,
}: {
  character: Character
  tracker?: TrackerState
  events: Array<{ category: string; reaction: string; created_at: string }>
}) {
  const [expanded, setExpanded] = useState(false)
  const emotionPalette = (character.emotion_palette as Array<{ key: string; label: string; desc: string }> | null) || GLYPH_STATES.map(s => ({ ...s }))

  const mask   = tracker?.mask   ?? 50
  const dagger = tracker?.dagger ?? 30
  const bottle = tracker?.bottle ?? 40
  const wound  = tracker?.wound  ?? 60

  const glyphValues = glyphValuesFromTrackers(mask, dagger, bottle, wound)
  const woundTrend = wound > 65 ? '↑' : wound < 35 ? '↓' : '→'
  const woundColor = wound > 65 ? 'var(--red)' : wound < 35 ? 'var(--gold)' : 'var(--text-dim)'

  const recentThree = events.slice(0, 3)

  return (
    <div
      className="card-dark overflow-hidden cursor-pointer transition-all"
      onClick={() => setExpanded(e => !e)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {character.portrait_url && (
              <img
                src={character.portrait_url}
                alt={character.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                style={{ border: '1px solid var(--gold-dim)' }}
              />
            )}
            <div>
              <h3 className="font-cinzel text-ink text-sm tracking-wider">{character.name}</h3>
              <p className="font-garamond text-ink-faint text-xs">
                Wound {wound}/100{' '}
                <span style={{ color: woundColor }}>{woundTrend}</span>
              </p>
            </div>
          </div>
          <ArcaneGlyph values={glyphValues} states={emotionPalette} size={80} />
        </div>

        {tracker?.play_directive && (
          <p className="play-directive text-sm mb-3">{tracker.play_directive}</p>
        )}

        {/* Recent events dots */}
        <div className="flex items-center gap-1.5">
          {recentThree.map((event, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: EVENT_COLORS[event.category] || 'var(--gold-dim)' }}
              title={event.category}
            />
          ))}
          {events.length > 3 && (
            <span className="font-garamond text-ink-faint text-xs">+{events.length - 3}</span>
          )}
        </div>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div
          className="animate-fade-in px-5 pb-5 pt-0"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="flex justify-center my-4">
            <ArcaneGlyph values={glyphValues} states={emotionPalette} size={220} />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Mask', value: mask },
              { label: 'Dagger', value: dagger },
              { label: 'Bottle', value: bottle },
              { label: 'Wound', value: wound },
            ].map(t => (
              <div key={t.label} className="p-3" style={{ background: 'var(--surface2)', borderRadius: 2 }}>
                <p className="label-caps mb-1">{t.label}</p>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 h-1.5 rounded-full"
                    style={{ background: 'var(--gold-faint)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${t.value}%`, background: 'var(--gold)', transition: 'width 600ms ease' }}
                    />
                  </div>
                  <span className="font-cinzel text-xs text-ink-dim">{t.value}</span>
                </div>
              </div>
            ))}
          </div>

          {events.length > 0 && (
            <div>
              <p className="label-caps mb-2">Recent Moments</p>
              <div className="space-y-1">
                {events.slice(0, 5).map((event, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: EVENT_COLORS[event.category] || 'var(--gold-dim)' }}
                    />
                    <span className="font-garamond text-ink-dim text-xs capitalize">
                      {event.category?.replace(/_/g, ' ')} · {event.reaction?.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


export default function DMDashboard({ campaigns, members, characters, trackers, recentEvents }: DMDashboardProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(campaigns[0]?.id || null)
  const [briefText, setBriefText] = useState('')
  const [briefLoading, setBriefLoading] = useState(false)
  // FIX 6: inline invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteInput, setInviteInput] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ success?: string; error?: string } | null>(null)

  const campaign = campaigns.find(c => c.id === selectedCampaign)
  const campaignMembers = members.filter(m => m.campaign_id === selectedCampaign)
  const campaignPlayerIds = campaignMembers.map(m => m.player_id)
  const campaignCharacters = characters.filter(c => campaignPlayerIds.includes(c.player_id))

  async function generateBrief() {
    if (!campaign) return
    setBriefLoading(true)
    try {
      const charData = campaignCharacters.map(c => {
        const tracker = trackers.find(t => t.character_id === c.id)
        const events = recentEvents.filter(e => e.character_id === c.id)
        return {
          name: c.name,
          playDirective: tracker?.play_directive || '',
          trackers: {
            mask:   tracker?.mask   ?? 50,
            dagger: tracker?.dagger ?? 30,
            bottle: tracker?.bottle ?? 40,
            wound:  tracker?.wound  ?? 60,
          },
          recentEvents: events.slice(0, 3).map(e => `${e.category}: ${e.reaction}`),
        }
      })

      const res = await fetch('/api/dm/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignName: campaign.name, characters: charData }),
      })
      const data = await res.json()
      setBriefText(data.brief || '')
    } catch {}
    setBriefLoading(false)
  }

  // FIX 2: invite player via service-side route (bypasses RLS)
  async function handleInvite() {
    if (!campaign || !inviteInput.trim()) return
    setInviteLoading(true)
    setInviteResult(null)
    try {
      const res = await fetch('/api/dm/add-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.id, input: inviteInput.trim() }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setInviteResult({ success: data.message || `${data.playerName} added to campaign.` })
        setInviteInput('')
      } else if (res.status === 409) {
        setInviteResult({ error: data.error }) // Already in campaign
      } else {
        setInviteResult({ error: data.error || 'Something went wrong.' })
      }
    } catch (e) {
      console.error('[dm-invite] exception:', e)
      setInviteResult({ error: e instanceof Error ? e.message : 'Something went wrong.' })
    }
    setInviteLoading(false)
  }
  const [sessionNotes, setSessionNotes] = useState('')
  const [notesSaving, setNotesSaving] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)

  async function saveSessionNotes() {
    if (!campaign || !sessionNotes.trim()) return
    setNotesSaving(true)
    try {
      await fetch('/api/dm/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.id, notes: sessionNotes }),
      })
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 2000)
    } catch {}
    setNotesSaving(false)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <BurgerMenu loggedIn={true} role="dm" />
      {/* Header */}
      <div
        className="px-6 py-5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="font-cinzel text-xl tracking-wider" style={{ color: 'var(--accent)' }}>In Character</h1>
          <span className="label-caps" style={{ paddingRight: 52 }}>DM Dashboard</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {campaigns.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-cinzel text-ink-faint text-sm tracking-wider mb-4">No campaigns yet</p>
            <a href="/onboarding?role=dm" className="btn-gold-solid px-8 py-3 inline-block">
              Create Campaign
            </a>
          </div>
        ) : (
          <>
            {/* Campaign selector */}
            {campaigns.length > 1 && (
              <div className="flex gap-2 mb-6 flex-wrap">
                {campaigns.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCampaign(c.id)}
                    className="font-cinzel text-xs tracking-widest px-4 py-2 transition-all"
                    style={{
                      border: `1px solid ${selectedCampaign === c.id ? 'var(--gold)' : 'var(--border)'}`,
                      color: selectedCampaign === c.id ? 'var(--gold)' : 'var(--text-faint)',
                      background: 'var(--surface)',
                      borderRadius: 2,
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            {campaign && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-cinzel text-lg tracking-wider" style={{ color: 'var(--text)' }}>{campaign.name}</h2>
                    <p className="font-garamond text-sm" style={{ color: 'var(--text-faint)' }}>
                      {campaignCharacters.length} character{campaignCharacters.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    {/* FIX 6: button opens inline modal, no page navigation */}
                    <button
                      className="btn-gold px-4 py-2 text-xs"
                      onClick={() => { setShowInviteModal(true); setInviteResult(null); setInviteInput('') }}
                    >
                      Invite Players
                    </button>
                    <button
                      className="btn-gold-solid px-4 py-2 text-xs"
                      onClick={generateBrief}
                      disabled={briefLoading || campaignCharacters.length === 0}
                    >
                      {briefLoading ? 'Generating...' : 'Pre-Session Brief'}
                    </button>
                  </div>
                </div>

                {/* Pre-session brief */}
                {briefText && (
                  <div
                    className="mb-6 p-5 animate-fade-in"
                    style={{
                      background: 'var(--surface)',
                      borderLeft: '2px solid var(--gold)',
                      borderRadius: 2,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="label-caps">Pre-Session Brief</p>
                      <button
                        className="label-caps text-ink-faint hover:text-ink-dim"
                        onClick={() => setBriefText('')}
                      >
                        Dismiss
                      </button>
                    </div>
                    <p className="font-garamond text-ink-dim leading-relaxed text-sm whitespace-pre-wrap">{briefText}</p>
                  </div>
                )}

                {/* Fix 9: DM session notes — private, never shown to players */}
                <div className="mb-6">
                  <p className="label-caps mb-2">Session Notes (DM Only)</p>
                  <textarea
                    value={sessionNotes}
                    onChange={e => setSessionNotes(e.target.value)}
                    placeholder="Private notes for this session. Never visible to players."
                    className="w-full px-4 py-3 min-h-[100px] text-sm"
                  />
                  <div className="flex justify-end mt-2">
                    <button onClick={saveSessionNotes} disabled={notesSaving || !sessionNotes.trim()}
                            className="btn-gold px-4 py-2 text-xs disabled:opacity-40">
                      {notesSaved ? 'Saved!' : notesSaving ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>
                </div>

                {/* Character cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaignCharacters.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <p className="font-cinzel text-ink-faint text-sm tracking-wider mb-2">No characters yet</p>
                      <p className="font-garamond text-ink-faint text-sm italic">
                        Invite players to get started. They&rsquo;ll create characters during onboarding.
                      </p>
                    </div>
                  ) : (
                    campaignCharacters.map(character => (
                      <CharacterCard
                        key={character.id}
                        character={character}
                        tracker={trackers.find(t => t.character_id === character.id)}
                        events={recentEvents.filter(e => e.character_id === character.id)}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* FIX 6: Inline invite modal */}
      {showInviteModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div style={{
            background: 'var(--surface)', border: '0.5px solid var(--border2)',
            borderRadius: 12, padding: 28, maxWidth: 400, width: '100%',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Add player</p>
              <button onClick={() => setShowInviteModal(false)}
                style={{ fontSize: 13, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}>
                Cancel
              </button>
            </div>
            {/* FIX 1: IC code only — no email */}
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.5 }}>
              Enter the player&rsquo;s IC code. They can find it in their Settings.
            </p>
            <input
              type="text"
              value={inviteInput}
              onChange={e => { setInviteInput(e.target.value.toUpperCase()); setInviteResult(null) }}
              placeholder="IC-XXXX-XXXX"
              style={{
                display: 'block', width: '100%', marginBottom: 12,
                background: 'var(--surface2)', border: '0.5px solid var(--border2)',
                color: 'var(--text)', fontSize: 14, borderRadius: 7, padding: '9px 12px',
                fontFamily: 'monospace', outline: 'none',
              }}
              autoFocus
            />
            {inviteResult?.error && (
              <p style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 12 }}>{inviteResult.error}</p>
            )}
            {inviteResult?.success && (
              <p style={{ fontSize: 13, color: 'var(--accent-text)', marginBottom: 12, fontWeight: 500 }}>
                ✓ {inviteResult.success}
              </p>
            )}
            <button
              className="btn-primary"
              style={{ width: '100%', fontSize: 13 }}
              onClick={handleInvite}
              disabled={inviteLoading || !inviteInput.trim()}
            >
              {inviteLoading ? 'Adding...' : 'Add player'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
