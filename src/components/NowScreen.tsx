'use client'

import { useState, useEffect, useCallback } from 'react'
import { Character, TrackerState, Session } from '@/types/database'
import ArcaneGlyph from './ArcaneGlyph'
import LogMomentFlow from './LogMomentFlow'
import { glyphValuesFromTrackers, GLYPH_STATES, getRandomLoadingPhrase } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

interface NowScreenProps {
  character: Character
  tracker: TrackerState | null
  session: Session | null
  recentEvents: Array<{ narrative: string | null; category: string; reaction: string }>
}

export default function NowScreen({ character, tracker: initialTracker, session, recentEvents }: NowScreenProps) {
  const [tracker, setTracker] = useState(initialTracker)
  const [directive, setDirective] = useState(initialTracker?.play_directive || '')
  const [directiveLoading, setDirectiveLoading] = useState(!initialTracker?.play_directive)
  const [loadingPhrase] = useState(getRandomLoadingPhrase())
  const [showLogFlow, setShowLogFlow] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [glyphSize, setGlyphSize] = useState(320)

  const emotionPalette = (character.emotion_palette as Array<{ key: string; label: string; desc: string }> | null) || GLYPH_STATES.map(s => ({ ...s }))

  const mask   = tracker?.mask   ?? 50
  const dagger = tracker?.dagger ?? 30
  const bottle = tracker?.bottle ?? 40
  const wound  = tracker?.wound  ?? 60

  const glyphValues = glyphValuesFromTrackers(mask, dagger, bottle, wound)

  const dominantEntry = Object.entries(glyphValues).reduce((a, b) => a[1] > b[1] ? a : b)
  const dominantState = emotionPalette.find(s => s.key === dominantEntry[0])

  // Responsive glyph size — 80vw on mobile, 400px max on desktop
  useEffect(() => {
    function updateSize() {
      const vw = window.innerWidth
      if (vw < 640) {
        setGlyphSize(Math.min(Math.floor(vw * 0.82), 380))
      } else {
        setGlyphSize(Math.min(400, vw - 80))
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!directive && character.dossier_text) { generateDirective() } }, [])

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('tracker_states') as any)
          .update({ play_directive: data.directive })
          .eq('character_id', character.id)
      }
    } catch {}
    setDirectiveLoading(false)
  }

  function handleEventLogged(newTracker: TrackerState, newDirective?: string) {
    setTracker(newTracker)
    if (newDirective) setDirective(newDirective)
    setShowLogFlow(false)
  }

  const handleStateClick = useCallback((key: string) => {
    setActiveTooltip(prev => prev === key ? null : key)
  }, [])

  const activeState = emotionPalette.find(s => s.key === activeTooltip)

  return (
    <div
      className="flex flex-col overflow-y-auto"
      style={{ minHeight: 'calc(100vh - 80px)' }}
      onClick={() => setActiveTooltip(null)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4"
           style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <span className="label-caps" style={{ fontSize: 13 }}>Now</span>
        <div className="flex items-center gap-3">
          {character.portrait_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={character.portrait_url} alt={character.name}
                 className="w-8 h-8 rounded-full object-cover"
                 style={{ border: '1px solid var(--gold-dim)' }} />
          )}
          <span className="font-cinzel tracking-wider" style={{ fontSize: 15, color: 'var(--text)' }}>
            {character.name}
          </span>
        </div>
      </div>

      {/* Play Directive */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <p className="label-caps mb-2" style={{ fontSize: 13 }}>Play as</p>
        {directiveLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-5 loading-shimmer rounded flex-1" />
            <span className="font-garamond text-xs animate-pulse" style={{ color: 'var(--text-faint)' }}>
              {loadingPhrase}
            </span>
          </div>
        ) : (
          <p className="play-directive" style={{ fontSize: 18, lineHeight: 1.4 }}>
            {directive || 'Play him like the performance is the only thing holding him together.'}
          </p>
        )}
      </div>

      {/* Arcane Glyph — center stage */}
      <div className="flex flex-col items-center justify-center py-6 px-4"
           style={{ flexShrink: 0 }}
           onClick={e => e.stopPropagation()}>
        <ArcaneGlyph
          values={glyphValues}
          states={emotionPalette}
          size={glyphSize}
          onStateClick={handleStateClick}
          activeTooltip={activeTooltip}
        />

        {/* Tooltip for clicked state */}
        {activeState && (
          <div className="animate-fade-in mt-3 mx-4"
               style={{
                 maxWidth: Math.min(glyphSize, 340),
                 background: 'var(--surface2)',
                 border: '1px solid var(--gold-dim)',
                 borderRadius: 2,
                 padding: '0.75rem 1rem',
               }}>
            <p className="font-cinzel tracking-wider mb-1"
               style={{ color: 'var(--accent)', fontSize: 14 }}>
              {activeState.label}
            </p>
            <p className="font-garamond leading-relaxed"
               style={{ color: 'var(--text-dim)', fontSize: 15 }}>
              {activeState.desc}
            </p>
          </div>
        )}
      </div>

      {/* Dominant behavioral cue */}
      {dominantState && !activeTooltip && (
        <div className="px-5 py-3 text-center" style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <p className="font-garamond" style={{ color: 'var(--text-dim)', fontSize: 15 }}>
            {dominantState.desc}
          </p>
        </div>
      )}

      {/* Log Moment button */}
      <div className="px-5 py-4" style={{ flexShrink: 0 }}>
        <button
          className="btn-gold-solid w-full"
          style={{ fontSize: 15, padding: '1rem', letterSpacing: '0.1em' }}
          onClick={() => setShowLogFlow(true)}
        >
          LOG MOMENT
        </button>
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
    </div>
  )
}
