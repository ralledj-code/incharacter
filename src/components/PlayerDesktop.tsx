'use client'

import { useState, useEffect } from 'react'
import { Character, TrackerState, Session, Event, Clue, Relationship } from '@/types/database'
import LogMomentFlow from './LogMomentFlow'
import LongRestModal from './LongRestModal'
import { glyphValuesFromTrackers, GLYPH_STATES, getRandomLoadingPhrase, EVENT_CATEGORIES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface PlayerDesktopProps {
  character: Character
  tracker: TrackerState | null
  session: Session | null
  recentEvents: Array<{ narrative: string | null; category: string; reaction: string }>
  sessionEvents: Event[]
  clues: Clue[]
  relationships: Relationship[]
  allSessions: Array<{ id: string; session_number: number; started_at: string; waking_text: string | null }>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

export default function PlayerDesktop({
  character, tracker: initialTracker, session, recentEvents,
  sessionEvents, clues, relationships, allSessions,
}: PlayerDesktopProps) {
  const router = useRouter()
  const [tracker, setTracker] = useState(initialTracker)
  const [directive, setDirective] = useState(initialTracker?.play_directive || '')
  const [directiveLoading, setDirectiveLoading] = useState(!initialTracker?.play_directive)
  const [loadingPhrase] = useState(getRandomLoadingPhrase())
  const [showLogFlow, setShowLogFlow] = useState(false)
  const [showLongRest, setShowLongRest] = useState(false)
  const [showPrep, setShowPrep] = useState(false)
  const [arcText, setArcText] = useState<string | null>(null)
  const [lastRestExpanded, setLastRestExpanded] = useState(false)
  const [barsVisible, setBarsVisible] = useState(false)

  const palette = (character.emotion_palette as Array<{ key: string; label: string; desc: string }> | null)
    || GLYPH_STATES.map(s => ({ ...s }))
  const config = character.tracker_config as AnyRec | null

  const mask   = tracker?.mask   ?? 50
  const dagger = tracker?.dagger ?? 30
  const bottle = tracker?.bottle ?? 40
  const wound  = tracker?.wound  ?? 60
  const glyphValues = glyphValuesFromTrackers(mask, dagger, bottle, wound)

  const stateList = palette.map(s => ({
    ...s,
    value: Math.round((glyphValues[s.key as keyof typeof glyphValues] ?? 0) * 100),
  })).sort((a, b) => b.value - a.value)

  const dominant = stateList[0]
  const clueBoardName    = (config?.clue_board_name as string)    || 'Clues'
  const clueBoardSubject = (config?.clue_board_subject as string) || 'the mystery'
  const lastRest = allSessions.find(s => s.waking_text)

  useEffect(() => { const t = setTimeout(() => setBarsVisible(true), 100); return () => clearTimeout(t) }, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!directive && character.dossier_text) generateDirective() }, [])
  useEffect(() => { if (allSessions.length >= 2 && !arcText) loadArc() }, [allSessions.length]) // eslint-disable-line

  async function generateDirective() {
    setDirectiveLoading(true)
    try {
      const res = await fetch('/api/claude/directive', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: character.id, characterName: character.name,
          dossierSummary: character.dossier_text?.slice(0, 2000) || '',
          trackers: { mask, dagger, bottle, wound },
          recentEvents: recentEvents.map(e => e.narrative || e.category) }),
      })
      const data = await res.json()
      if (data.directive) {
        setDirective(data.directive)
        const supabase = createClient()
        await (supabase.from('tracker_states') as AnyRec)
          .update({ play_directive: data.directive }).eq('character_id', character.id)
      }
    } catch {}
    setDirectiveLoading(false)
  }

  async function loadArc() {
    try {
      const res = await fetch('/api/claude/arc', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: character.id, characterName: character.name,
          dossierSummary: character.dossier_text?.slice(0, 1000) || '',
          trackers: { mask, dagger, bottle, wound }, sessionCount: allSessions.length,
          recentEvents: recentEvents.map(e => e.narrative || e.category) }),
      })
      const data = await res.json()
      if (data.arc) setArcText(data.arc)
    } catch {}
  }

  function handleEventLogged(newTracker: TrackerState, newDirective?: string) {
    setTracker(newTracker)
    if (newDirective) setDirective(newDirective)
    setShowLogFlow(false)
    router.refresh()
  }

  const p = { fontFamily: 'inherit' } // inherits system-ui from body

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 44px)', overflow: 'hidden', background: 'var(--bg)', ...p }}>

      {/* ── LEFT PANEL ─────────────────────────── */}
      <div style={{
        width: 340, flexShrink: 0, height: '100%', overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
        borderRight: '0.5px solid var(--border)', background: 'var(--bg)',
      }}>
        {/* Character name */}
        <div style={{ padding: '20px 24px 12px' }}>
          <p style={{ fontSize: 12, color: 'var(--text3)', letterSpacing: '0.02em' }}>{character.name}</p>
        </div>

        <div style={{ borderBottom: '0.5px solid var(--border)', margin: '0 0 0' }} />

        {/* Directive */}
        <div style={{ padding: '20px 24px 16px' }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--accent)', opacity: 0.8, marginBottom: 10 }}>
            Play as
          </p>
          {directiveLoading ? (
            <div>
              <div className="loading-shimmer" style={{ height: 22, marginBottom: 6, width: '90%' }} />
              <div className="loading-shimmer" style={{ height: 22, width: '70%' }} />
              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>{loadingPhrase}</p>
            </div>
          ) : (
            <p style={{ fontSize: 22, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.45, color: 'var(--text)' }}>
              {directive || 'Play them true to who they are.'}
            </p>
          )}
        </div>

        <div style={{ borderBottom: '0.5px solid var(--border)' }} />

        {/* State bars */}
        <div style={{ padding: '16px 24px' }}>
          {stateList.map((s, idx) => {
            const isDominant = idx === 0
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <span style={{ fontSize: 11, width: 76, textAlign: 'right', flexShrink: 0, letterSpacing: '-0.01em',
                  color: isDominant ? 'var(--accent-text)' : 'var(--text2)', fontWeight: isDominant ? 600 : 400 }}>
                  {s.label}
                </span>
                <div style={{ flex: 1, height: 3, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2,
                    background: isDominant ? 'var(--accent)' : 'var(--border2)',
                    width: barsVisible ? `${s.value}%` : '0%',
                    transition: 'width 0.8s ease' }} />
                </div>
                <span style={{ fontSize: 10, color: 'var(--text3)', width: 22, textAlign: 'right', flexShrink: 0 }}>
                  {s.value}
                </span>
              </div>
            )
          })}
        </div>

        {/* Dominant state */}
        {dominant && (
          <div style={{ margin: '0 20px 16px', padding: '10px 14px', background: 'var(--surface)', border: '0.5px solid var(--border)', borderLeft: '2px solid var(--accent)', borderRadius: '0 8px 8px 0' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-text)', marginBottom: 3 }}>{dominant.label}</p>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{dominant.desc}</p>
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* LOG MOMENT */}
        <div style={{ padding: '12px 20px 20px', borderTop: '0.5px solid var(--border)' }}>
          <button className="btn-primary" style={{ width: '100%', fontSize: 13 }}
            onClick={() => setShowLogFlow(true)}>
            Log moment
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────── */}
      <div style={{ flex: 1, height: '100%', overflowY: 'auto' }}>

        {/* This session */}
        <section style={{ borderBottom: '0.5px solid var(--border)', padding: '20px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text3)' }}>
              Session {session?.session_number || 1}
            </p>
            <button className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px', minHeight: 'auto' }}
              onClick={async () => {
                if (!session) return
                const supabase = createClient()
                const db = (t: string) => (supabase.from(t) as AnyRec)
                const { data: last } = await db('sessions').select('session_number').eq('character_id', character.id).order('session_number', { ascending: false }).limit(1).single()
                await db('sessions').update({ ended_at: new Date().toISOString() }).eq('id', session.id)
                await db('sessions').insert({ character_id: character.id, session_number: ((last as AnyRec)?.session_number || 1) + 1 })
                router.refresh()
              }}>
              New session
            </button>
          </div>
          {sessionEvents.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--text3)', fontStyle: 'italic' }}>Nothing logged yet.</p>
          ) : (
            <div>
              {sessionEvents.slice(-8).map(ev => {
                const cat = EVENT_CATEGORIES.find(c => c.id === ev.category)
                const time = new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                return (
                  <div key={ev.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{cat?.icon || '◆'}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 2 }}>{cat?.label || ev.category}</p>
                      <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{ev.narrative || ev.subcategory}</p>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>{time}</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* The arc */}
        {allSessions.length >= 1 && (
          <section style={{ borderBottom: '0.5px solid var(--border)', padding: '20px 28px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>The arc</p>
            {arcText ? (
              <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.75 }}>{arcText}</p>
            ) : (
              <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px', minHeight: 'auto' }}
                onClick={loadArc}>Generate arc</button>
            )}
          </section>
        )}

        {/* Last rest */}
        {lastRest?.waking_text && (
          <section style={{ borderBottom: '0.5px solid var(--border)', padding: '20px 28px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>Last time</p>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, fontStyle: 'italic',
              ...(lastRestExpanded ? {} : { overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties) }}>
              {lastRest.waking_text}
            </p>
            {!lastRestExpanded && (
              <button onClick={() => setLastRestExpanded(true)}
                style={{ fontSize: 12, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', minHeight: 'auto' }}>
                Show more
              </button>
            )}
          </section>
        )}

        {/* Clues */}
        <section style={{ borderBottom: '0.5px solid var(--border)', padding: '20px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text3)' }}>{clueBoardName}</p>
            <a href="/play/journey" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', minHeight: 'auto', minWidth: 'auto' }}>View all</a>
          </div>
          {clues.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--text3)', fontStyle: 'italic' }}>No clues about {clueBoardSubject} yet.</p>
          ) : (
            clues.slice(0, 3).map(c => (
              <div key={c.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '0.5px solid var(--border)' }}>
                <p style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>{c.source_type}</p>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{c.narrative || c.raw_text}</p>
              </div>
            ))
          )}
        </section>

        {/* Relationships */}
        {relationships.length > 0 && (
          <section style={{ borderBottom: '0.5px solid var(--border)', padding: '20px 28px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12 }}>Relationships</p>
            {Array.from(new Set(relationships.map(r => r.npc_name))).slice(0, 3).map(npc => {
              const latest = relationships.find(r => r.npc_name === npc)
              return (
                <div key={npc} style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent-text)', marginBottom: 3 }}>{npc}</p>
                  {latest?.narrative && <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{latest.narrative}</p>}
                </div>
              )
            })}
          </section>
        )}

        {/* Bottom actions */}
        <div style={{ position: 'sticky', bottom: 0, padding: '12px 28px 20px', background: 'var(--bg)', borderTop: '0.5px solid var(--border)', display: 'flex', gap: 10 }}>
          <button className="btn-secondary" style={{ flex: 1, fontSize: 13 }} onClick={() => setShowLongRest(true)}>Long rest</button>
          <button className="btn-primary" style={{ flex: 2, fontSize: 13 }} onClick={() => setShowPrep(true)}>Prep me for next session</button>
        </div>
      </div>

      {showLogFlow && session && (
        <LogMomentFlow character={character} tracker={tracker} session={session}
          onComplete={handleEventLogged} onDismiss={() => setShowLogFlow(false)} />
      )}
      {showLongRest && session && (
        <LongRestModal character={character} session={session} tracker={tracker}
          onComplete={() => { setShowLongRest(false); router.refresh() }}
          onDismiss={() => setShowLongRest(false)} />
      )}
      {showPrep && <PrepInline character={character} tracker={tracker} clues={clues} relationships={relationships} onDismiss={() => setShowPrep(false)} />}
    </div>
  )
}

function PrepInline({ character, tracker, clues, relationships, onDismiss }: {
  character: Character; tracker: TrackerState | null; clues: Clue[]; relationships: Relationship[];
  onDismiss: () => void
}) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const config = character.tracker_config as AnyRec | null
        const latestBelief = clues.find(c => c.current_belief)?.current_belief
        const relStates: string[] = []
        const seen = new Set<string>()
        relationships.forEach(r => { if (!seen.has(r.npc_name) && r.current_state) { relStates.push(`${r.npc_name}: ${r.current_state}`); seen.add(r.npc_name) } })
        const res = await fetch('/api/claude/prep', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ characterId: character.id, characterName: character.name,
            dossierSummary: character.dossier_text?.slice(0, 1500) || '',
            trackers: { mask: tracker?.mask ?? 50, dagger: tracker?.dagger ?? 30, bottle: tracker?.bottle ?? 40, wound: tracker?.wound ?? 60 },
            cluesSummary: latestBelief || '', relationshipSummaries: relStates,
            boardSubject: (config?.clue_board_subject as string) || 'the antagonist' }),
        })
        const data = await res.json()
        setText(data.prep || '')
      } catch {}
      setLoading(false)
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border2)', borderRadius: 12, padding: 28, maxWidth: 520, width: '100%', maxHeight: '75vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Prep for next session</p>
          <button onClick={onDismiss} className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px', minHeight: 'auto' }}>Done</button>
        </div>
        {loading ? (
          <p style={{ fontSize: 14, color: 'var(--text3)', fontStyle: 'italic' }}>Reading the signs...</p>
        ) : (
          <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{text}</p>
        )}
      </div>
    </div>
  )
}
