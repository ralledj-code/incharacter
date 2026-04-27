'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Character, TrackerState, Session } from '@/types/database'
import { EVENT_CATEGORIES, REACTIONS, applyTrackerDeltas, getRandomLoadingPhrase } from '@/lib/constants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ConfigRecord = Record<string, any>

// Display multipliers for reaction impact preview (user-facing only, not used in actual computation)
const REACTION_DISPLAY_MULTIPLIERS: Record<string, number> = {
  owned_it:             1.0,
  enjoyed_too_much:     1.5,
  hated_himself:       -1.0,
  didnt_feel_it:        0.3,
  scared_himself:       1.2,
  doesnt_want_to_think: 0.5,
}

type PaletteEntry = { id: string; name: string }

// event_weights keys differ from category IDs for the two dynamic categories
function lookupWeights(catId: string, ew: Record<string, Record<string, number>>): Record<string, number> {
  return ew[catId]
    || (catId === 'dagger' ? ew['special'] : catId === 'mystery' ? ew['antagonist'] : undefined)
    || {}
}

function stateImpacts(weights: Record<string, number>, palette: PaletteEntry[]) {
  return Object.entries(weights)
    .filter(([, w]) => w !== 0)
    .map(([id, w]) => ({ name: palette.find(s => s.id === id)?.name ?? id, weight: w }))
    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
}

/** Build event categories from tracker_config, overriding label/desc/icon/subcategories for dynamic categories */
function buildCategories(character: { tracker_config?: unknown }): typeof EVENT_CATEGORIES {
  const config = character.tracker_config as ConfigRecord | null
  if (!config) return EVENT_CATEGORIES
  const base = EVENT_CATEGORIES.map(c => ({ ...c, subcategories: [...c.subcategories] })) as unknown as Array<typeof EVENT_CATEGORIES[number]>

  const el = config.dangerous_element_category as ConfigRecord | undefined
  if (el?.name) {
    const idx = base.findIndex(c => (c as ConfigRecord).id === 'dagger' || (c as ConfigRecord).id === 'special')
    if (idx !== -1) {
      (base as ConfigRecord[])[idx] = {
        ...base[idx],
        label: el.name,
        desc: el.description || base[idx].desc,
        icon: el.icon || base[idx].icon,
        // Generic subcategories — no character-specific text
        subcategories: [
          'It happened — not fully in control',
          'Heard or sensed something others didn\'t',
          'Used it deliberately',
          'It surfaced unexpectedly',
          'A surge or slip',
        ],
      }
    }
  }

  const ant = config.antagonist_category as ConfigRecord | undefined
  const antSubject = config.clue_board_subject as string || 'them'
  if (ant?.name) {
    const idx = base.findIndex(c => (c as ConfigRecord).id === 'mystery' || (c as ConfigRecord).id === 'antagonist')
    if (idx !== -1) {
      (base as ConfigRecord[])[idx] = {
        ...base[idx],
        label: ant.name,
        desc: ant.description || base[idx].desc,
        icon: ant.icon || base[idx].icon,
        subcategories: [
          `Found a clue about ${antSubject}`,
          `Saw something connected to ${antSubject}`,
          `Met someone who knows ${antSubject}`,
          'A piece of the picture clicked into place',
          'Something contradicted what they thought they knew',
        ],
      }
    }
  }

  return base as unknown as typeof EVENT_CATEGORIES
}
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

  // Fix 12: dynamic categories from tracker_config
  const categories = buildCategories(character)
  const category = categories.find(c => c.id === selectedCategory)

  const config = character.tracker_config as ConfigRecord | null
  const emotionPalette = (config?.emotion_palette as PaletteEntry[] | null) ?? []
  const eventWeights = (config?.event_weights as Record<string, Record<string, number>> | null) ?? {}

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
      console.log('[log-moment] start:', selectedCategory, selectedSubcategory, reaction)

      // Generate narrative
      console.log('[log-moment] fetching narrative')
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
        }),
      })
      const narrativeData = await res.json()
      const narrative = narrativeData.narrative || `${selectedSubcategory}. ${reaction}.`
      console.log('[log-moment] narrative ok:', narrative.slice(0, 60))

      const supabase = createClient()

      // Save event to DB
      console.log('[log-moment] saving event to DB')
      const { error: eventErr } = await (supabase.from('events') as AnyRecord).insert({
        session_id: session.id,
        character_id: character.id,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        reaction,
        narrative,
        tracker_delta: delta,
      })
      if (eventErr) console.log('[log-moment] event insert error:', eventErr.message)
      else console.log('[log-moment] event saved')

      // Update tracker state (raw mask/dagger/bottle/wound)
      console.log('[log-moment] updating tracker_states')
      const { data: newState, error: trackerErr } = await (supabase.from('tracker_states') as AnyRecord)
        .update({ ...newTrackers, updated_at: new Date().toISOString() })
        .eq('character_id', character.id)
        .select()
        .single()
      if (trackerErr) console.log('[log-moment] tracker update error:', trackerErr.message)
      else console.log('[log-moment] tracker updated')

      // Call directive API — always, every moment
      const config = character.tracker_config as ConfigRecord | null
      const emotionPalette = config?.emotion_palette as Array<{ id: string; name: string; description: string; base_value: number }> | undefined

      let newDirective: string | undefined
      let updatedGlyphStates: Record<string, number> | undefined
      console.log('[log-moment] calling directive API')
      try {
        const directiveRes = await fetch('/api/claude/directive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            characterId: character.id,
            characterName: character.name,
            dossierSummary: character.dossier_text?.slice(0, 2000) || '',
            trackers: newTrackers,
            currentEvent: { category: selectedCategory, subcategory: selectedSubcategory, reaction },
            emotionPalette,
          }),
        })
        console.log('[log-moment] directive response status:', directiveRes.status)
        if (directiveRes.ok) {
          const dData = await directiveRes.json()
          newDirective = dData.directive
          if (dData.glyphStates) updatedGlyphStates = dData.glyphStates
          console.log('[log-moment] directive ok:', newDirective?.slice(0, 60))
        } else {
          const errText = await directiveRes.text()
          console.log('[log-moment] directive error response:', errText.slice(0, 200))
        }
      } catch (dirErr) {
        console.log('[log-moment] directive fetch threw:', String(dirErr))
      }

      // Log replay — wrapped separately so it never blocks onComplete
      try {
        await (supabase.from('session_replays') as AnyRecord).insert({
          session_id: session.id,
          event_type: 'moment_logged',
          event_data: { category: selectedCategory, subcategory: selectedSubcategory, reaction, narrative, delta, trackers: newTrackers },
        })
      } catch { /* non-critical */ }

      const finalTracker = {
        ...((newState as TrackerState) || { ...tracker!, ...newTrackers }),
        ...(updatedGlyphStates ? { glyph_states: updatedGlyphStates } : {}),
      }
      console.log('[log-moment] calling onComplete, directive present:', !!newDirective)
      onComplete(finalTracker as TrackerState, newDirective)
    } catch (error) {
      console.log('[log-moment] outer catch:', String(error))
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
      {/* Header — Fix 14: back button visible on all steps */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          {step !== 'generating' && (
            <button
              className="label-caps transition-colors"
              style={{ color: 'var(--text-faint)', minHeight: 44, minWidth: 44 }}
              onClick={() => {
                if (step === 'category') { onDismiss(); return }
                if (step === 'subcategory') { setStep('category'); return }
                if (step === 'reaction') { setStep('subcategory'); return }
              }}
            >
              ← {step === 'category' ? 'Close' : 'Back'}
            </button>
          )}
          <span className="label-caps" style={{ fontSize: 13 }}>
            {step === 'category' ? 'What happened?' :
             step === 'subcategory' ? 'Specifically?' :
             step === 'reaction' ? 'How did they take it?' :
             'Writing the moment...'}
          </span>
        </div>
        {step !== 'generating' && step !== 'category' && (
          <button
            className="label-caps transition-colors"
            style={{ color: 'var(--text-faint)', minHeight: 44 }}
            onClick={onDismiss}
          >
            Cancel
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false}>
          {/* Step: Category */}
          {step === 'category' && (
            <motion.div key="category"
              initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 overflow-y-auto px-5 py-6"
            >
              <div className="grid grid-cols-2 gap-3">
                {categories.map(cat => {
                  const impacts = stateImpacts(lookupWeights((cat as ConfigRecord).id, eventWeights), emotionPalette)
                  return (
                    <button key={(cat as ConfigRecord).id}
                      onClick={() => { setSelectedCategory((cat as ConfigRecord).id); setStep('subcategory') }}
                      className="p-4 text-left transition-all active:scale-95 card-hover"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 2 }}
                    >
                      <div className="text-xl mb-2">{cat.icon}</div>
                      <p className="font-cinzel text-xs tracking-wider mb-1" style={{ color: 'var(--accent)' }}>{cat.label}</p>
                      <p className="font-garamond text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>{cat.desc}</p>
                      {impacts.length > 0 && (
                        <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6, lineHeight: 1.6 }}>
                          {impacts.map((s, i) => (
                            <span key={i} style={{ marginRight: 6 }}>
                              {s.weight > 0 ? '↑' : '↓'} {s.name}
                            </span>
                          ))}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Step: Subcategory */}
          {step === 'subcategory' && category && (
            <motion.div key="subcategory"
              initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 overflow-y-auto px-5 py-6"
            >
              <p className="font-cinzel text-xs tracking-widest mb-4" style={{ color: 'var(--accent)' }}>
                {category.icon} {category.label}
              </p>
              {/* Subcategories inherit parent category weights — compute once */}
              {(() => {
                const catImpacts = stateImpacts(lookupWeights((category as ConfigRecord).id, eventWeights), emotionPalette)
                return (
                  <div className="space-y-2">
                    {category.subcategories.map(sub => (
                      <button key={sub}
                        onClick={() => { setSelectedSubcategory(sub); setStep('reaction') }}
                        className="w-full p-4 text-left transition-all"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 2 }}
                      >
                        <p className="font-garamond" style={{ color: 'var(--text)' }}>{sub}</p>
                        {catImpacts.length > 0 && (
                          <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4, lineHeight: 1.6 }}>
                            {catImpacts.map((s, i) => (
                              <span key={i} style={{ marginRight: 6 }}>
                                {s.weight > 0 ? '↑' : '↓'} {s.name}
                              </span>
                            ))}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )
              })()}
            </motion.div>
          )}

          {/* Step: Reaction */}
          {step === 'reaction' && (
            <motion.div key="reaction"
              initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 overflow-y-auto px-5 py-6"
            >
              <p className="font-cinzel text-xs tracking-widest mb-4" style={{ color: 'var(--accent)' }}>How did they take it?</p>
              <div className="space-y-2">
                {REACTIONS.map(r => {
                  const multiplier = REACTION_DISPLAY_MULTIPLIERS[r.id] ?? 1.0
                  const baseWeights = selectedCategory ? lookupWeights(selectedCategory, eventWeights) : {}
                  const impacts = Object.entries(baseWeights)
                    .map(([id, w]) => ({
                      name: emotionPalette.find(s => s.id === id)?.name ?? id,
                      delta: Math.round(w * multiplier),
                    }))
                    .filter(({ delta }) => delta !== 0)
                    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))

                  return (
                    <button key={r.id}
                      onClick={() => handleReactionSelect(r.id)}
                      className="w-full p-4 text-left transition-all"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 2 }}
                    >
                      <p className="font-cinzel text-sm tracking-wider mb-1" style={{ color: 'var(--text)' }}>{r.label}</p>
                      <p className="font-garamond text-sm" style={{ color: 'var(--text-faint)' }}>{r.desc}</p>
                      {impacts.length > 0 && (
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: 6 }}>
                          {impacts.map(({ name, delta }, i) => (
                            <span key={i} style={{
                              fontSize: 11,
                              color: delta > 0 ? 'var(--accent-text)' : 'var(--danger)',
                            }}>
                              {delta > 0 ? '+' : ''}{delta} {name}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
          {/* Generating */}
          {step === 'generating' && (
            <motion.div key="generating"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4"
            >
              <div className="w-12 h-12 rounded-full animate-spin"
                   style={{ border: '2px solid var(--gold-faint)', borderTopColor: 'var(--accent)' }} />
              <p className="font-garamond animate-pulse" style={{ color: 'var(--text-dim)' }}>{loadingPhrase}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
