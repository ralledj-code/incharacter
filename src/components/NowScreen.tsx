'use client'

import { useState, useEffect } from 'react'
import { Character, TrackerState, Session } from '@/types/database'
import LogMomentFlow from './LogMomentFlow'
import LongRestModal from './LongRestModal'
import { glyphValuesFromTrackers, GLYPH_STATES, getRandomLoadingPhrase } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface NowScreenProps {
  character: Character
  tracker: TrackerState | null
  session: Session | null
  recentEvents: Array<{ narrative: string | null; category: string; reaction: string }>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

export default function NowScreen({ character, tracker: initialTracker, session, recentEvents }: NowScreenProps) {
  const router = useRouter()
  const [tracker, setTracker] = useState(initialTracker)
  const [directive, setDirective] = useState(initialTracker?.play_directive || '')
  const [directiveLoading, setDirectiveLoading] = useState(!initialTracker?.play_directive)
  const [loadingPhrase] = useState(getRandomLoadingPhrase())
  const [showLogFlow, setShowLogFlow] = useState(false)
  const [showLongRest, setShowLongRest] = useState(false)
  const [barsVisible, setBarsVisible] = useState(false)

  const emotionPalette = (character.emotion_palette as Array<{ key: string; label: string; desc: string }> | null)
    || GLYPH_STATES.map(s => ({ ...s }))

  const mask   = tracker?.mask   ?? 50
  const dagger = tracker?.dagger ?? 30
  const bottle = tracker?.bottle ?? 40
  const wound  = tracker?.wound  ?? 60

  const glyphValues = glyphValuesFromTrackers(mask, dagger, bottle, wound)

  // Build state bar list sorted by value descending
  const stateList = emotionPalette.map(s => ({
    ...s,
    value: Math.round((glyphValues[s.key as keyof typeof glyphValues] ?? 0) * 100),
  })).sort((a, b) => b.value - a.value)

  const dominant = stateList[0]

  // Animate bars on mount
  useEffect(() => {
    const t = setTimeout(() => setBarsVisible(true), 120)
    return () => clearTimeout(t)
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!directive && character.dossier_text) generateDirective() }, [])

  async function generateDirective() {
    setDirectiveLoading(true)
    try {
      const res = await fetch('/api/claude/directive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          characterName: character.name,
          dossierSummary: character.dossier_text?.slice(0, 2000) || '',
          trackers: { mask, dagger, bottle, wound },
          recentEvents: recentEvents.map(e => e.narrative || e.category),
        }),
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

  function handleEventLogged(newTracker: TrackerState, newDirective?: string) {
    setTracker(newTracker)
    if (newDirective) setDirective(newDirective)
    setShowLogFlow(false)
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflowY: 'auto' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', width: '100%', padding: '48px 24px 32px', flex: 1 }}>

        {/* Character name */}
        <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', marginBottom: 40, letterSpacing: '0.02em' }}>
          {character.name}
        </p>

        {/* Play as label */}
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--accent)', opacity: 0.8, textAlign: 'center', marginBottom: 14 }}>
          Play as
        </p>

        {/* Directive */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          {directiveLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
              <div className="loading-shimmer" style={{ height: 28, width: '80%' }} />
              <div className="loading-shimmer" style={{ height: 28, width: '60%' }} />
              <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>{loadingPhrase}</p>
            </div>
          ) : (
            <p style={{ fontSize: 26, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.45, color: 'var(--text)' }}>
              {directive || 'Play them true to who they are.'}
            </p>
          )}
        </div>

        {/* State bars */}
        <div style={{ marginBottom: 28 }}>
          {stateList.map((s, idx) => {
            const isDominant = idx === 0
            const barWidth = barsVisible ? `${s.value}%` : '0%'
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                {/* State name */}
                <span style={{
                  fontSize: 12, width: 84, textAlign: 'right', flexShrink: 0,
                  color: isDominant ? 'var(--accent-text)' : 'var(--text2)',
                  fontWeight: isDominant ? 600 : 400,
                  letterSpacing: '-0.01em',
                }}>
                  {s.label}
                </span>
                {/* Bar track */}
                <div style={{ flex: 1, height: 3, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    background: isDominant ? 'var(--accent)' : 'var(--border2)',
                    width: barWidth,
                    transition: 'width 0.8s ease',
                  }} />
                </div>
                {/* Value */}
                <span style={{ fontSize: 11, color: 'var(--text3)', width: 24, textAlign: 'right', flexShrink: 0 }}>
                  {s.value}
                </span>
              </div>
            )
          })}
        </div>

        {/* Dominant state card */}
        {dominant && (
          <div style={{ marginBottom: 36 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-text)', marginBottom: 4, letterSpacing: '-0.01em' }}>
              {dominant.label}
            </p>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5, maxWidth: 320 }}>
              {dominant.desc}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn-primary"
            style={{ flex: 1, fontSize: 13 }}
            onClick={() => setShowLogFlow(true)}
          >
            Log moment
          </button>
          <button
            className="btn-secondary"
            style={{ flex: 1, fontSize: 13 }}
            onClick={() => setShowLongRest(true)}
          >
            Long rest
          </button>
        </div>
      </div>

      {showLogFlow && session && (
        <LogMomentFlow
          character={character}
          tracker={tracker}
          session={session}
          onComplete={handleEventLogged}
          onDismiss={() => setShowLogFlow(false)}
        />
      )}
      {showLongRest && session && (
        <LongRestModal
          character={character}
          session={session}
          tracker={tracker}
          onComplete={() => { setShowLongRest(false); router.refresh() }}
          onDismiss={() => setShowLongRest(false)}
        />
      )}
    </div>
  )
}
