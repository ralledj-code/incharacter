'use client'

import { useState } from 'react'
import { Character, TrackerState, Session } from '@/types/database'
import { EVENT_CATEGORIES, REACTIONS, applyTrackerDeltas, getRandomLoadingPhrase } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

type FlowStep = 'category' | 'subcategory' | 'reaction' | 'generating'

interface LogMomentFlowProps {
  character: Character
  tracker: TrackerState | null
  session: Session | null
  onComplete: (newTracker: TrackerState, newDirective?: string) => void
  onDismiss: () => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

export default function LogMomentFlow({ character, tracker, session, onComplete, onDismiss }: LogMomentFlowProps) {
  const [step, setStep] = useState<FlowStep>('category')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [, setSelectedReaction] = useState<string | null>(null)
  const [loadingPhrase] = useState(getRandomLoadingPhrase())

  const category = EVENT_CATEGORIES.find(c => c.id === selectedCategory)

  async function handleReactionSelect(reaction: string) {
    if (!selectedCategory || !selectedSubcategory || !session) return
    setSelectedReaction(reaction)
    setStep('generating')

    const currentTrackers = {
      mask:   tracker?.mask   ?? 50,
      dagger: tracker?.dagger ?? 30,
      bottle: tracker?.bottle ?? 40,
      wound:  tracker?.wound  ?? 60,
    }

    const newTrackers = applyTrackerDeltas(currentTrackers, selectedCategory, reaction)
    const delta = {
      mask:   newTrackers.mask   - currentTrackers.mask,
      dagger: newTrackers.dagger - currentTrackers.dagger,
      bottle: newTrackers.bottle - currentTrackers.bottle,
      wound:  newTrackers.wound  - currentTrackers.wound,
    }

    try {
      // Generate narrative via API
      const res = await fetch('/api/claude/event-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          characterName: character.name,
          dossierSummary: character.dossier_text?.slice(0, 2000) || '',
          trackers: currentTrackers,
          category: selectedCategory,
          subcategory: selectedSubcategory,
          reaction,
          apiKey: character.api_key_encrypted,
        }),
      })
      const narrativeData = await res.json()
      const narrative = narrativeData.narrative || `${selectedSubcategory}. ${reaction}.`

      const supabase = createClient()

      // Save event to DB
      await (supabase.from('events') as AnyRecord).insert({
        session_id: session.id,
        character_id: character.id,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        reaction,
        narrative,
        tracker_delta: delta,
      })

      // Update tracker state
      const { data: newState } = await (supabase.from('tracker_states') as AnyRecord)
        .update({ ...newTrackers, updated_at: new Date().toISOString() })
        .eq('character_id', character.id)
        .select()
        .single()

      // Check for threshold crossing
      let newDirective: string | undefined
      const maxDelta = Math.max(...Object.values(delta).map(Math.abs))
      if (maxDelta >= 15 && character.api_key_encrypted) {
        const directiveRes = await fetch('/api/claude/directive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            characterId: character.id,
            characterName: character.name,
            dossierSummary: character.dossier_text?.slice(0, 2000) || '',
            trackers: newTrackers,
            apiKey: character.api_key_encrypted,
          }),
        })
        const dData = await directiveRes.json()
        newDirective = dData.directive
      }

      // Log replay
      await (supabase.from('session_replays') as AnyRecord).insert({
        session_id: session.id,
        event_type: 'moment_logged',
        event_data: {
          category: selectedCategory,
          subcategory: selectedSubcategory,
          reaction,
          narrative,
          delta,
          trackers: newTrackers,
        },
      })

      onComplete((newState as TrackerState) || { ...tracker!, ...newTrackers }, newDirective)
    } catch (error) {
      // Log error silently
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        await (supabase.from('error_logs') as AnyRecord).insert({
          user_id: user?.id,
          character_id: character.id,
          screen: 'now',
          action: 'log_moment',
          error_message: String(error),
        })
      } catch {}
      // Still complete with updated trackers even if API failed
      const supabase = createClient()
      const { data: newState } = await (supabase.from('tracker_states') as AnyRecord)
        .update({ ...newTrackers, updated_at: new Date().toISOString() })
        .eq('character_id', character.id)
        .select()
        .single()
      onComplete((newState as TrackerState) || { ...tracker!, ...newTrackers })
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(10,5,0,0.96)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          {step !== 'category' && step !== 'generating' && (
            <button
              className="label-caps text-ink-faint hover:text-ink-dim transition-colors"
              onClick={() => setStep(prev => {
                if (prev === 'subcategory') return 'category'
                if (prev === 'reaction') return 'subcategory'
                return prev
              })}
            >
              ← Back
            </button>
          )}
          <span className="label-caps">
            {step === 'category' ? 'What happened?' :
             step === 'subcategory' ? 'Specifically?' :
             step === 'reaction' ? 'How did he take it?' :
             'Writing the moment...'}
          </span>
        </div>
        {step !== 'generating' && (
          <button
            className="label-caps text-ink-faint hover:text-ink-dim transition-colors"
            onClick={onDismiss}
          >
            Cancel
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* Step: Category */}
        {step === 'category' && (
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            {EVENT_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setStep('subcategory') }}
                className="p-4 text-left transition-all active:scale-95"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 2,
                }}
              >
                <div className="text-xl mb-2">{cat.icon}</div>
                <p className="font-cinzel text-gold text-xs tracking-wider mb-1">{cat.label}</p>
                <p className="font-garamond text-ink-faint text-xs leading-relaxed">{cat.desc}</p>
              </button>
            ))}
          </div>
        )}

        {/* Step: Subcategory */}
        {step === 'subcategory' && category && (
          <div className="space-y-2 animate-fade-in">
            <p className="font-cinzel text-gold text-xs tracking-widest mb-4">
              {category.icon} {category.label}
            </p>
            {category.subcategories.map(sub => (
              <button
                key={sub}
                onClick={() => { setSelectedSubcategory(sub); setStep('reaction') }}
                className="w-full p-4 text-left transition-all"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 2,
                }}
              >
                <p className="font-garamond text-ink">{sub}</p>
              </button>
            ))}
          </div>
        )}

        {/* Step: Reaction */}
        {step === 'reaction' && (
          <div className="space-y-2 animate-fade-in">
            <p className="font-cinzel text-gold text-xs tracking-widest mb-4">How did he take it?</p>
            {REACTIONS.map(r => (
              <button
                key={r.id}
                onClick={() => handleReactionSelect(r.id)}
                className="w-full p-4 text-left transition-all"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 2,
                }}
              >
                <p className="font-cinzel text-ink text-sm tracking-wider mb-1">{r.label}</p>
                <p className="font-garamond text-ink-faint text-sm italic">{r.desc}</p>
              </button>
            ))}
          </div>
        )}

        {/* Generating */}
        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-4 animate-fade-in">
            <div
              className="w-12 h-12 rounded-full animate-spin"
              style={{ border: '2px solid var(--gold-faint)', borderTopColor: 'var(--gold)' }}
            />
            <p className="font-garamond text-ink-dim italic animate-pulse">{loadingPhrase}</p>
          </div>
        )}
      </div>
    </div>
  )
}
