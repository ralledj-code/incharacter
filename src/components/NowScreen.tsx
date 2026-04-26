'use client'

import { useState, useEffect, useCallback } from 'react'
import { Character, TrackerState, Session } from '@/types/database'
import ArcaneGlyph from './ArcaneGlyph'
import LogMomentFlow from './LogMomentFlow'
import InfoTip from './InfoTip'
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
  const portrait = character.portrait_url

  const emotionPalette = (character.emotion_palette as Array<{ key: string; label: string; desc: string }> | null) || GLYPH_STATES.map(s => ({ ...s }))

  const mask   = tracker?.mask   ?? 50
  const dagger = tracker?.dagger ?? 30
  const bottle = tracker?.bottle ?? 40
  const wound  = tracker?.wound  ?? 60

  const glyphValues = glyphValuesFromTrackers(mask, dagger, bottle, wound)

  // Dominant state
  const glyphEntries = Object.entries(glyphValues)
  const dominantEntry = glyphEntries.reduce((a, b) => a[1] > b[1] ? a : b)
  const dominantState = emotionPalette.find(s => s.key === dominantEntry[0])

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
          // apiKey is fetched server-side — never sent from client
        }),
      })
      const data = await res.json()
      if (data.directive) {
        setDirective(data.directive)
        // Save to DB
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
    <div className="flex flex-col h-full min-h-[calc(100vh-80px)]" onClick={() => setActiveTooltip(null)}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="label-caps">Now</span>
        <div className="flex items-center gap-3">
          {portrait && (
            <img
              src={portrait}
              alt={character.name}
              className="w-8 h-8 rounded-full object-cover"
              style={{ border: '1px solid var(--gold-dim)' }}
            />
          )}
          <span className="font-cinzel text-ink text-sm tracking-wider">{character.name}</span>
        </div>
      </div>

      {/* Play Directive */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-start gap-2 mb-2">
          <span className="label-caps">Play Him As</span>
          <InfoTip text="This is your behavioral anchor for the session. It updates when something significant shifts. Read it before each scene." />
        </div>
        {directiveLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-5 loading-shimmer rounded flex-1" />
            <span className="font-garamond text-xs text-ink-faint italic animate-pulse">{loadingPhrase}</span>
          </div>
        ) : (
          <p className="play-directive">{directive || 'Play him like the performance is the only thing holding him together.'}</p>
        )}
      </div>

      {/* Arcane Glyph — center stage */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 px-4">
        <div className="relative" onClick={e => e.stopPropagation()}>
          <ArcaneGlyph
            values={glyphValues}
            states={emotionPalette}
            size={Math.min(320, typeof window !== 'undefined' ? window.innerWidth - 48 : 320)}
            onStateClick={handleStateClick}
            activeTooltip={activeTooltip}
          />
        </div>

        {/* Tooltip for clicked state */}
        {activeState && (
          <div
            className="animate-fade-in mt-2 mx-4 max-w-xs"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--gold-dim)',
              borderRadius: 2,
              padding: '0.75rem 1rem',
            }}
          >
            <p className="font-cinzel text-gold text-xs tracking-wider mb-1">{activeState.label}</p>
            <p className="font-garamond text-ink-dim text-sm italic">{activeState.desc}</p>
          </div>
        )}
      </div>

      {/* Dominant behavioral cue */}
      {dominantState && (
        <div className="px-5 py-4 text-center" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="font-garamond text-ink-dim italic text-sm">
            {dominantState.desc}
          </p>
        </div>
      )}

      {/* Log Moment button */}
      <div className="px-5 pb-4">
        <button
          className="btn-gold-solid w-full py-4 text-sm tracking-widest"
          onClick={() => setShowLogFlow(true)}
        >
          LOG MOMENT
        </button>
      </div>

      {/* Log Moment Flow Modal */}
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
