'use client'

import { useState, useEffect, useCallback } from 'react'
import { Character, TrackerState, Session, Event, Clue, Relationship } from '@/types/database'
import ArcaneGlyph from './ArcaneGlyph'
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
  character,
  tracker: initialTracker,
  session,
  recentEvents,
  sessionEvents,
  clues,
  relationships,
  allSessions,
}: PlayerDesktopProps) {
  const router = useRouter()
  const [tracker, setTracker] = useState(initialTracker)
  const [directive, setDirective] = useState(initialTracker?.play_directive || '')
  const [directiveLoading, setDirectiveLoading] = useState(!initialTracker?.play_directive)
  const [loadingPhrase] = useState(getRandomLoadingPhrase())
  const [showLogFlow, setShowLogFlow] = useState(false)
  const [showLongRest, setShowLongRest] = useState(false)
  const [showPrepModal, setShowPrepModal] = useState(false)
  const [arcText, setArcText] = useState<string | null>(null)
  const [arcLoading, setArcLoading] = useState(false)
  const [lastRestExpanded, setLastRestExpanded] = useState(false)

  const palette = (character.emotion_palette as Array<{ key: string; label: string; desc: string }> | null)
    || GLYPH_STATES.map(s => ({ ...s }))
  const config = character.tracker_config as AnyRec | null

  const mask   = tracker?.mask   ?? 50
  const dagger = tracker?.dagger ?? 30
  const bottle = tracker?.bottle ?? 40
  const wound  = tracker?.wound  ?? 60
  const glyphValues = glyphValuesFromTrackers(mask, dagger, bottle, wound)

  const dominantEntry = Object.entries(glyphValues).reduce((a, b) => a[1] > b[1] ? a : b)
  const dominantState = palette.find(s => s.key === dominantEntry[0])

  const clueBoardName    = (config?.clue_board_name as string)    || 'Clues'
  const clueBoardSubject = (config?.clue_board_subject as string) || 'the mystery'
  const lastRest = allSessions.find(s => s.waking_text)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!directive && character.dossier_text) generateDirective() }, [])

  // Load arc text when sessions exist
  useEffect(() => {
    if (allSessions.length >= 2 && !arcText) loadArc()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSessions.length])

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
    if (arcLoading) return
    setArcLoading(true)
    try {
      const res = await fetch('/api/claude/arc', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id, characterName: character.name,
          dossierSummary: character.dossier_text?.slice(0, 1000) || '',
          trackers: { mask, dagger, bottle, wound },
          sessionCount: allSessions.length,
          recentEvents: recentEvents.map(e => e.narrative || e.category),
        }),
      })
      const data = await res.json()
      if (data.arc) setArcText(data.arc)
    } catch {}
    setArcLoading(false)
  }

  function handleEventLogged(newTracker: TrackerState, newDirective?: string) {
    setTracker(newTracker)
    if (newDirective) setDirective(newDirective)
    setShowLogFlow(false)
    router.refresh()
  }

  const handleStateClick = useCallback((key: string) => {
    // No-op on desktop — labels are always visible
    void key
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* ── LEFT PANEL ─────────────────────────────────────────── */}
      <div style={{
        width: 340, flexShrink: 0, height: '100vh', overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
        borderRight: '1px solid var(--accent-dim)',
        background: 'var(--bg)',
      }}>
        {/* Character name */}
        <div style={{ padding: '1rem 1.5rem 0.5rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {character.portrait_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={character.portrait_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--accent-dim)' }} />
            )}
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
              {character.name}
            </span>
          </div>
        </div>

        {/* Directive — most important element */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: 8 }}>
            Play as
          </p>
          {directiveLoading ? (
            <div style={{ height: 24, borderRadius: 2, background: 'var(--surface2)', animation: 'shimmer 1.5s infinite' }} />
          ) : (
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: 17, fontWeight: 600, color: 'var(--accent)', lineHeight: 1.45, letterSpacing: '0.02em' }}>
              {directive || loadingPhrase}
            </p>
          )}
        </div>

        {/* Glyph — fills panel width */}
        <div style={{ padding: '1.5rem 1rem', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <ArcaneGlyph
            values={glyphValues}
            states={palette}
            size={290}
            onStateClick={handleStateClick}
          />
        </div>

        {/* Dominant state card */}
        {dominantState && (
          <div style={{
            margin: '0 1.25rem 1rem',
            padding: '0.75rem 1rem',
            background: 'var(--surface)',
            borderLeft: '2px solid var(--accent)',
            borderRadius: 2,
            flexShrink: 0,
          }}>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: 4 }}>
              {dominantState.label}
            </p>
            <p style={{ fontFamily: 'EB Garamond, serif', fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {dominantState.desc}
            </p>
          </div>
        )}

        {/* Spacer pushes LOG MOMENT to bottom */}
        <div style={{ flex: 1 }} />

        {/* LOG MOMENT — pinned to bottom of left panel */}
        <div style={{ padding: '1rem 1.25rem 1.5rem', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button
            onClick={() => setShowLogFlow(true)}
            style={{
              width: '100%', fontFamily: 'Cinzel, serif', fontSize: 14,
              letterSpacing: '0.12em', padding: '0.9rem',
              background: 'var(--accent)', border: 'none', color: '#0f0f0f',
              cursor: 'pointer', borderRadius: 2, fontWeight: 600,
            }}
          >
            LOG MOMENT
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────── */}
      <div style={{ flex: 1, height: '100vh', overflowY: 'auto', padding: '0 0 6rem' }}>

        {/* This Session */}
        <section style={{ borderBottom: '1px solid var(--border)', padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.18em', color: 'var(--text-faint)', textTransform: 'uppercase' }}>
              Session {session?.session_number || 1}
            </h2>
            <button onClick={async () => {
              if (!session) return
              const supabase = createClient()
              const db = (t: string) => (supabase.from(t) as AnyRec)
              const { data: last } = await db('sessions').select('session_number').eq('character_id', character.id)
                .order('session_number', { ascending: false }).limit(1).single()
              await db('sessions').update({ ended_at: new Date().toISOString() }).eq('id', session.id)
              await db('sessions').insert({ character_id: character.id, session_number: ((last as AnyRec)?.session_number || 1) + 1 })
              router.refresh()
            }} style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.1em', color: 'var(--text-faint)', background: 'transparent', border: '1px solid var(--border)', padding: '0.35rem 0.75rem', cursor: 'pointer', borderRadius: 2 }}>
              New Session
            </button>
          </div>

          {sessionEvents.length === 0 ? (
            <p style={{ fontFamily: 'EB Garamond, serif', fontSize: 15, color: 'var(--text-faint)', fontStyle: 'italic' }}>
              Nothing logged yet. The session begins when you do.
            </p>
          ) : (
            <div>
              {sessionEvents.slice(-8).map(ev => {
                const cat = EVENT_CATEGORIES.find(c => c.id === ev.category)
                const time = new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                return (
                  <div key={ev.id} style={{ display: 'flex', gap: 10, padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 15, flexShrink: 0 }}>{cat?.icon || '◆'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'Cinzel, serif', fontSize: 11, color: 'var(--accent)', marginBottom: 2, letterSpacing: '0.08em' }}>
                        {cat?.label || ev.category}
                      </p>
                      <p style={{ fontFamily: 'EB Garamond, serif', fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {ev.narrative || ev.subcategory}
                      </p>
                    </div>
                    <span style={{ fontFamily: 'EB Garamond, serif', fontSize: 11, color: 'var(--text-faint)', flexShrink: 0, marginTop: 2 }}>{time}</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* The Arc */}
        {allSessions.length >= 1 && (
          <section style={{ borderBottom: '1px solid var(--border)', padding: '1.5rem 2rem' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.18em', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '1rem' }}>
              The Arc
            </h2>
            {arcLoading ? (
              <p style={{ fontFamily: 'EB Garamond, serif', fontSize: 14, color: 'var(--text-faint)', fontStyle: 'italic' }}>
                Reading the signs...
              </p>
            ) : arcText ? (
              <p style={{ fontFamily: 'EB Garamond, serif', fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.7 }}>
                {arcText}
              </p>
            ) : (
              <button onClick={loadArc}
                style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.1em', color: 'var(--accent)', background: 'transparent', border: '1px solid var(--accent-dim)', padding: '0.4rem 0.9rem', cursor: 'pointer', borderRadius: 2 }}>
                Generate Arc
              </button>
            )}
          </section>
        )}

        {/* Last time — waking monologue */}
        {lastRest?.waking_text && (
          <section style={{ borderBottom: '1px solid var(--border)', padding: '1.5rem 2rem' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.18em', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Last Time
            </h2>
            <p style={{
              fontFamily: 'EB Garamond, serif', fontSize: 15, color: 'var(--text-secondary)',
              lineHeight: 1.7, fontStyle: 'italic',
              overflow: lastRestExpanded ? undefined : 'hidden',
              display: lastRestExpanded ? undefined : '-webkit-box',
              WebkitLineClamp: lastRestExpanded ? undefined : 2,
              WebkitBoxOrient: lastRestExpanded ? undefined : 'vertical',
            } as React.CSSProperties}>
              {lastRest.waking_text}
            </p>
            {!lastRestExpanded && (
              <button onClick={() => setLastRestExpanded(true)}
                style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-faint)', background: 'transparent', border: 'none', padding: '0.25rem 0', cursor: 'pointer', marginTop: 4 }}>
                Show more
              </button>
            )}
          </section>
        )}

        {/* Clue board */}
        <section style={{ borderBottom: '1px solid var(--border)', padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.18em', color: 'var(--text-faint)', textTransform: 'uppercase' }}>
              {clueBoardName}
            </h2>
            <a href="/play/journey" style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.1em', color: 'var(--accent)', textDecoration: 'none' }}>View all</a>
          </div>
          {clues.length === 0 ? (
            <p style={{ fontFamily: 'EB Garamond, serif', fontSize: 14, color: 'var(--text-faint)', fontStyle: 'italic' }}>
              No clues about {clueBoardSubject} yet.
            </p>
          ) : (
            clues.slice(0, 3).map(c => (
              <div key={c.id} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: 3 }}>
                  {c.source_type}
                </p>
                <p style={{ fontFamily: 'EB Garamond, serif', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {c.narrative || c.raw_text}
                </p>
              </div>
            ))
          )}
          <a href="/play/journey" style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.1em', color: 'var(--accent)', textDecoration: 'none', border: '1px solid var(--accent-dim)', padding: '0.4rem 0.9rem', display: 'inline-block', borderRadius: 2, marginTop: 4 }}>
            Add Clue
          </a>
        </section>

        {/* Relationships */}
        {relationships.length > 0 && (
          <section style={{ borderBottom: '1px solid var(--border)', padding: '1.5rem 2rem' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.18em', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Relationships
            </h2>
            {Array.from(new Set(relationships.map(r => r.npc_name))).slice(0, 3).map(npc => {
              const latest = relationships.find(r => r.npc_name === npc)
              return (
                <div key={npc} style={{ marginBottom: '0.75rem' }}>
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 3 }}>{npc}</p>
                  {latest?.narrative && (
                    <p style={{ fontFamily: 'EB Garamond, serif', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {latest.narrative}
                    </p>
                  )}
                </div>
              )
            })}
          </section>
        )}

        {/* Bottom actions */}
        <div style={{ position: 'sticky', bottom: 0, padding: '1rem 2rem', background: 'var(--bg)', borderTop: '1px solid var(--border)', display: 'flex', gap: 12 }}>
          <button onClick={() => setShowLongRest(true)}
            style={{ flex: 1, fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: '0.1em', padding: '0.75rem', background: 'transparent', border: '1px solid var(--accent-dim)', color: 'var(--accent)', cursor: 'pointer', borderRadius: 2 }}>
            Long Rest
          </button>
          <button onClick={() => setShowPrepModal(true)}
            style={{ flex: 2, fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: '0.1em', padding: '0.75rem', background: 'var(--accent)', border: 'none', color: '#0f0f0f', cursor: 'pointer', borderRadius: 2, fontWeight: 600 }}>
            Prep Me For Next Session
          </button>
        </div>
      </div>

      {/* Modals */}
      {showLogFlow && session && (
        <LogMomentFlow character={character} tracker={tracker} session={session}
          onComplete={handleEventLogged} onDismiss={() => setShowLogFlow(false)} />
      )}
      {showLongRest && session && (
        <LongRestModal character={character} session={session} tracker={tracker}
          onComplete={() => { setShowLongRest(false); router.refresh() }}
          onDismiss={() => setShowLongRest(false)} />
      )}
      {showPrepModal && (
        <PrepOverlay character={character} tracker={tracker} clues={clues} relationships={relationships}
          onDismiss={() => setShowPrepModal(false)} />
      )}
    </div>
  )
}

// Inline prep overlay to avoid import cycle
function PrepOverlay({ character, tracker, clues, relationships, onDismiss }: {
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
          body: JSON.stringify({
            characterId: character.id, characterName: character.name,
            dossierSummary: character.dossier_text?.slice(0, 1500) || '',
            trackers: { mask: tracker?.mask ?? 50, dagger: tracker?.dagger ?? 30, bottle: tracker?.bottle ?? 40, wound: tracker?.wound ?? 60 },
            cluesSummary: latestBelief || '', relationshipSummaries: relStates,
            boardSubject: (config?.clue_board_subject as string) || 'the antagonist',
          }),
        })
        const data = await res.json()
        setText(data.prep || '')
      } catch {}
      setLoading(false)
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 4, padding: '2rem', maxWidth: 560, width: '100%', maxHeight: '80vh', overflowY: 'auto', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 14, letterSpacing: '0.12em', color: 'var(--accent)' }}>Prep For Next Session</h2>
          <button onClick={onDismiss} style={{ fontFamily: 'Cinzel, serif', fontSize: 12, color: 'var(--text-faint)', background: 'transparent', border: 'none', cursor: 'pointer' }}>Done</button>
        </div>
        {loading ? (
          <p style={{ fontFamily: 'EB Garamond, serif', fontSize: 15, color: 'var(--text-faint)', fontStyle: 'italic' }}>Reading the signs...</p>
        ) : (
          <p style={{ fontFamily: 'EB Garamond, serif', fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{text}</p>
        )}
      </div>
    </div>
  )
}
