'use client'

import { useState, useEffect, useRef } from 'react'
import { Character, TrackerState, Session } from '@/types/database'
import LogMomentFlow from './LogMomentFlow'
import LongRestModal from './LongRestModal'
import { getRandomLoadingPhrase } from '@/lib/constants'
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

  const config = character.tracker_config as AnyRec | null
  const trackerNames = config?.trackerNames as { mask?: string; dagger?: string; bottle?: string; wound?: string } | undefined
  const configPalette = config?.emotion_palette as Array<{ id: string; name: string; description: string; base_value: number }> | null

  const stateValues = tracker?.state_values as Record<string, number> | null

  // Bars read from tracker_config.emotion_palette + state_values JSONB
  const stateList = (configPalette || []).map(s => ({
    key: s.id,
    label: s.name.toUpperCase(),
    desc: s.description,
    value: Math.round(stateValues?.[s.id] ?? s.base_value),
  })).sort((a, b) => b.value - a.value)

  const dominant = stateList[0]

  useEffect(() => {
    const t = setTimeout(() => setBarsVisible(true), 120)
    return () => clearTimeout(t)
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!directive && character.dossier_text) generateDirective() }, [])

  async function generateDirective(opts?: { newTracker?: TrackerState; previousDirective?: string }) {
    isUpdatingDirective.current = true
    setDirectiveLoading(true)
    try {
      // Dominant state from whichever system is active
      const domEntry = dominant ? { label: dominant.label, desc: dominant.desc } : undefined

      const res = await fetch('/api/claude/directive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          characterName: character.name,
          dossierSummary: character.dossier_text?.slice(0, 2000) || '',
          trackerNames,
          dominantState: domEntry,
          previousDirective: opts?.previousDirective || undefined,
          emotionPalette: configPalette || undefined,
          recentEvents: recentEvents.map(e => e.narrative || e.category),
        }),
      })
      const data = await res.json()
      if (data.directive) {
        setDirective(data.directive)
        // Update local state_values from server response so bars re-render
        if (data.stateValues) {
          setTracker(prev => prev ? { ...prev, state_values: data.stateValues } : prev)
        }
      }
    } catch {}
    isUpdatingDirective.current = false
    setDirectiveLoading(false)
  }

  const [directiveFading, setDirectiveFading] = useState(false)
  const isUpdatingDirective = useRef(false)

  // Every moment now triggers directive from LogMomentFlow — just apply the result
  async function handleEventLogged(newTracker: TrackerState, newDirective?: string) {
    // Update tracker state (includes state_values from directive response)
    setTracker(newTracker)

    if (newDirective) {
      setDirectiveFading(true)
      setTimeout(() => { setDirective(newDirective); setDirectiveFading(false) }, 300)
    }

    setShowLogFlow(false)
    // Only refresh if directive write has finished to avoid stale value overwrite
    if (!isUpdatingDirective.current) {
      router.refresh()
    }
  }

  return (
    // FIX 1: single centred column, no two-panel
    <div style={{ width: '100%', paddingBottom: 32 }}>
      {/* FIX 3: exact spacing top-to-bottom */}
      <div style={{
        maxWidth: 520,
        margin: '0 auto',
        padding: '48px 24px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>

        {/* Character name */}
        <p style={{ fontSize: 12, color: 'var(--text3)', letterSpacing: '0.02em', marginBottom: 40 }}>
          {character.name}
        </p>

        {/* PLAY AS label */}
        <p style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--accent)',
          opacity: 0.8, marginBottom: 14,
        }}>
          Play as
        </p>

        {/* FIX 3: directive 26px 300-weight centred */}
        <div style={{ textAlign: 'center', marginBottom: 40, width: '100%' }}>
          {directiveLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div className="loading-shimmer" style={{ height: 30, width: '82%', borderRadius: 4 }} />
              <div className="loading-shimmer" style={{ height: 30, width: '64%', borderRadius: 4 }} />
              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>{loadingPhrase}</p>
            </div>
          ) : (
            /* FIX 2: fade transition when directive updates */
            <p style={{
              fontSize: 26, fontWeight: 300, letterSpacing: '-0.02em',
              lineHeight: 1.45, color: 'var(--text)',
              opacity: directiveFading ? 0 : 1,
              transition: 'opacity 300ms ease',
            }}>
              {directive || `Play ${character.name} true to who they are.`}
            </p>
          )}
        </div>

        {/* FIX 2: state bars — full container width, exact dimensions */}
        <div style={{ width: '100%', marginBottom: 28 }}>
          {stateList.map((s, idx) => {
            const isDominant = idx === 0
            return (
              <div key={s.key} style={{
                display: 'flex', alignItems: 'center', marginBottom: 8,
              }}>
                {/* FIX 2: 96px fixed, right-aligned, nowrap */}
                <span style={{
                  width: 96, flexShrink: 0, textAlign: 'right',
                  fontSize: 12, whiteSpace: 'nowrap',
                  color: isDominant ? 'var(--accent-text)' : 'var(--text2)',
                  fontWeight: isDominant ? 600 : 400,
                  letterSpacing: '-0.01em',
                }}>
                  {s.label}
                </span>
                {/* FIX 2: bar track flex 1, height 3px, margin 0 10px */}
                <div style={{
                  flex: 1, margin: '0 10px', height: 3,
                  background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    background: isDominant ? 'var(--accent)' : 'var(--border2)',
                    width: barsVisible ? `${s.value}%` : '0%',
                    transition: 'width 0.8s ease',
                  }} />
                </div>
                {/* FIX 2: 28px wide, left-aligned */}
                <span style={{
                  width: 28, flexShrink: 0, textAlign: 'left',
                  fontSize: 11, color: 'var(--text3)',
                }}>
                  {s.value}
                </span>
              </div>
            )
          })}
        </div>

        {/* FIX 3: dominant state — 28px below bars, 36px above buttons */}
        {dominant && (
          <div style={{ width: '100%', marginBottom: 36 }}>
            <p style={{
              fontSize: 13, fontWeight: 600, color: 'var(--accent-text)',
              marginBottom: 4, letterSpacing: '-0.01em',
            }}>
              {dominant.label}
            </p>
            <p style={{
              fontSize: 14, color: 'var(--text2)', lineHeight: 1.5,
            }}>
              {dominant.desc}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
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
